// src/server/api/routers/order/order.router.ts

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";
import { orders, orderItems, product } from "@/server/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

//Delivery processing function stub
async function processDelivery(orderId: string) {}

// single order item
const orderItem = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(orderItem).min(1), // non-empty items array
        shippingAddress: z.string(),
        paymentMethod: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userID = ctx.session.user.id;

      // transaction
      const transaction = await db.transaction(async (tx) => {
        const productIds = input.items.map((i) => i.productId);

        // get order item details by product IDs
        const products = await tx
          .select()
          .from(product)
          .where(inArray(product.id, productIds));

        const productMap = new Map(
          products.map((product) => [product.id, product]),
        );

        // Calculate unit prices, subtotals and total amount
        let totalAmount = 0;

        for (const item of input.items) {
          const product = productMap.get(item.productId);

          //validate if product exists and is in stock
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${item.productId} not found`,
            });
          }

          if (product.quantityInStock < item.quantity) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `This quantity of product ${product.name} is not in stock`,
            });
          }

          // calculate total amount
          const unitPrice = Number(product.price);
          totalAmount += unitPrice * item.quantity;
        }

        const totalAmountString = totalAmount.toFixed(2);

        // insert order into db
        const [createdOrder] = await tx
          .insert(orders)
          .values({
            userId: userID,
            status: "processing",
            totalAmount: totalAmountString,
            shippingAddress: input.shippingAddress,
            paymentMethod: input.paymentMethod,
          })
          .returning();

        if (!createdOrder) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          });
        }

        // insert each order item into db
        for (const item of input.items) {
          const p = productMap.get(item.productId)!;
          const unitPriceNumber = Number(p.price);
          const subtotalNumber = unitPriceNumber * item.quantity;

          await tx.insert(orderItems).values({
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: unitPriceNumber.toFixed(2),
            subtotal: subtotalNumber.toFixed(2),
          });

          if (!p) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${item.productId} not found`,
            });
          }

          // update product stock for each order item
          await tx
            .update(product)
            .set({
              quantityInStock: p.quantityInStock - item.quantity,
            })
            .where(eq(product.id, item.productId));
        }

        return {
          orderId: createdOrder.id,
          status: createdOrder.status,
          totalAmount: createdOrder.totalAmount,
        };
      });

      // process delivery (stub)
      await processDelivery(transaction.orderId);

      return transaction;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    //helper function to get basic info about orders by status also sorted by createdAt in descending order
    async function getOrdersSorted(
      status: "processing" | "in_transit" | "delivered",
    ) {
      return ctx.db.query.orders.findMany({
        where: and(eq(orders.userId, userId), eq(orders.status, status)),
        columns: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: desc(orders.createdAt),
      });
    }

    //get basic info about orders by status
    const processing = await getOrdersSorted("processing");
    const inTransit = await getOrdersSorted("in_transit");
    const delivered = await getOrdersSorted("delivered");

    const all = [...processing, ...inTransit, ...delivered];

    return all;
  }),

  getById: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      //find the order by ID
      const order = await ctx.db.query.orders.findFirst({
        where: and(eq(orders.id, input.orderId), eq(orders.userId, userId)),
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      //find the order items by order ID
      const items = await ctx.db.query.orderItems.findMany({
        where: eq(orderItems.orderId, input.orderId),
        with: {
          product: true,
        },
      });

      return {
        orderId: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        orderItems: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          productName: item.product.name,
          productImage: item.product.frontImage,
        })),
      };
    }),
});
