// src/server/api/routers/order/order.router.ts

import {
  createTRPCRouter,
  protectedProcedure,
  productManagerProcedure,
  salesManagerProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";
import { orders, orderItems, product, refunds, user } from "@/server/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { processDelivery } from "@/server/services/send-invoice";
import { processRefundDecisionEmail } from "@/server/services/send-refund-email";

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
          const unitPrice =
            product.discountPercentage > 0
              ? Number(product.price) * (1 - product.discountPercentage / 100)
              : Number(product.price);
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
          const discountPercentNumber = Number(p.discountPercentage);
          const subtotalNumber =
            p.discountPercentage > 0
              ? unitPriceNumber * (1 - discountPercentNumber / 100)
              : unitPriceNumber * item.quantity;

          await tx.insert(orderItems).values({
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: unitPriceNumber.toFixed(2),
            discountPercent: discountPercentNumber.toFixed(2),
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

      await processDelivery(transaction.orderId);

      return transaction;
    }),

  updateStatus: productManagerProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        status: z.enum(["processing", "in_transit", "delivered", "cancelled"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.orderId));
    }),

  getAllAdmin: productManagerProcedure.query(async ({ ctx }) => {
    const allOrders = await ctx.db.query.orders.findMany({
      columns: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
      orderBy: desc(orders.createdAt),
    });
    return allOrders;
  }),

  getAllAdminSales: salesManagerProcedure.query(async ({ ctx }) => {
    const allOrders = await ctx.db.query.orders.findMany({
      orderBy: desc(orders.createdAt),
      where: and(eq(orders.status, "delivered")),
      with: {
        user: true,
        orderItems: {
          with: {
            product: true,
            refunds: true,
          },
        },
      },
    });

    return allOrders
      .filter((order) => {
        const hasRefund = order.orderItems.some((item) =>
          item.refunds.some(
            (r) => r.status === "approved" || r.status === "refunded",
          ),
        );
        return !hasRefund;
      })
      .map((order) => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          subtotal: item.subtotal,
          productCost: item.product.cost,
          productName: item.product.name,
          productImage: item.product.frontImage,
        })),
      }));
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
        with: {
          user: true,
          orderItems: { with: { product: true } },
        },
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

      const itemIds = items.map((i) => i.id);
      const refundRows =
        itemIds.length === 0
          ? []
          : await ctx.db.query.refunds.findMany({
              where: inArray(refunds.orderItemId, itemIds),
              columns: {
                orderItemId: true,
                status: true,
              },
            });

      const refundMap = new Map(
        refundRows.map((r) => [r.orderItemId, r.status]),
      );

      return {
        orderId: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          discountPercent: item.discountPercent,
          productName: item.product.name,
          productImage: item.product.frontImage,

          refundStatus: refundMap.get(item.id) ?? null,
        })),
      };
    }),

  getByIdAdminSales: salesManagerProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // find the order by ID
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          user: true,
          orderItems: { with: { product: true, refunds: true } },
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        orderId: order.id,
        user: order.user,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          subtotal: item.subtotal,
          productCost: item.product.cost,
          productName: item.product.name,
          productImage: item.product.frontImage,

          refundStatus: item.refunds[0]?.status,
        })),
      };
    }),

  getByIdAdmin: productManagerProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // find the order by ID
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          user: true,
          orderItems: { with: { product: true, refunds: true } },
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // find the order items by order ID
      const items = await ctx.db.query.orderItems.findMany({
        where: eq(orderItems.orderId, input.orderId),
        with: {
          product: true,
          refunds: true,
        },
      });

      const itemIds = items.map((i) => i.id);
      const refundRows =
        itemIds.length === 0
          ? []
          : await ctx.db.query.refunds.findMany({
              where: inArray(refunds.orderItemId, itemIds),
              columns: {
                orderItemId: true,
                status: true,
              },
            });

      const refundMap = new Map(
        refundRows.map((r) => [r.orderItemId, r.status]),
      );

      return {
        orderId: order.id,
        user: order.user,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        refunds: order.orderItems.map((item) => ({
          id: item.refunds[0]?.id,
          status: item.refunds[0]?.status,
        })),
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          subtotal: item.subtotal,
          productName: item.product.name,
          productImage: item.product.frontImage,

          refundStatus: refundMap.get(item.id) ?? null,
        })),
      };
    }),

  cancelOrder: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const order = await ctx.db.query.orders.findFirst({
        where: and(eq(orders.id, input.orderId), eq(orders.userId, userId)),
        with: {
          orderItems: { with: { product: true } },
        },
      });

      if (!order)
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });

      if (order.status !== "processing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only processing orders can be cancelled.",
        });
      }

      await ctx.db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, order.id));

      for (const item of order.orderItems) {
        await ctx.db
          .update(product)
          .set({
            quantityInStock: item.product.quantityInStock + item.quantity,
          })
          .where(eq(product.id, item.productId));
      }

      return { ok: true };
    }),

  refundRequest: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        // if you want refund for a single item, pass orderItemId; else it will request for all items
        orderItemId: z.string().uuid().optional(),
        reason: z.string().min(3).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const order = await ctx.db.query.orders.findFirst({
        where: and(eq(orders.id, input.orderId), eq(orders.userId, userId)),
      });

      if (!order)
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });

      if (order.status !== "delivered") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Refund is only available for delivered orders.",
        });
      }

      // 30-day rule (using createdAt as you requested)
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - order.createdAt.getTime() > THIRTY_DAYS_MS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Refund window expired (30 days).",
        });
      }

      // Fetch items (single or all)
      const items = await ctx.db.query.orderItems.findMany({
        where: and(
          eq(orderItems.orderId, order.id),
          input.orderItemId ? eq(orderItems.id, input.orderItemId) : undefined,
        ),
      });

      if (items.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order item(s) not found.",
        });
      }

      const itemIds = items.map((i) => i.id);

      // Prevent duplicates (allow only if previous was rejected)
      const existing = await ctx.db.query.refunds.findMany({
        where: inArray(refunds.orderItemId, itemIds),
      });

      const existingByItem = new Map(existing.map((r) => [r.orderItemId, r]));
      for (const it of items) {
        const prev = existingByItem.get(it.id);
        if (prev && prev.status !== "rejected") {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Refund request already exists for one of the selected items.",
          });
        }
      }

      // Create refund requests
      await ctx.db.insert(refunds).values(
        items.map((it) => ({
          orderItemId: it.id,
          managerId: null,
          status: "pending" as const,
          refundAmount: it.subtotal, // good default
          reason: input.reason,
        })),
      );

      return { ok: true };
    }),

  refundRequestsList: salesManagerProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        refundId: refunds.id,
        refundStatus: refunds.status,
        refundAmount: refunds.refundAmount,
        reason: refunds.reason,
        requestDate: refunds.requestDate,
        managerId: refunds.managerId,

        orderItemId: orderItems.id,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        subtotal: orderItems.subtotal,

        orderId: orders.id,
        orderStatus: orders.status,
        orderCreatedAt: orders.createdAt,

        productId: product.id,
        productName: product.name,
        productModel: product.model,
        productCategory: product.category,
        frontImage: product.frontImage,
        backImage: product.backImage,

        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      })
      .from(refunds)
      .innerJoin(orderItems, eq(refunds.orderItemId, orderItems.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(product, eq(orderItems.productId, product.id))
      .innerJoin(user, eq(orders.userId, user.id))
      .where(eq(refunds.status, "pending"))
      .orderBy(desc(refunds.requestDate));

    return rows;
  }),

  refundDecision: salesManagerProcedure
    .input(
      z.object({
        refundId: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const r = await ctx.db.query.refunds.findFirst({
        where: eq(refunds.id, input.refundId),
      });
      if (!r)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Refund request not found.",
        });

      if (r.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending refund requests can be decided.",
        });
      }

      const item = await ctx.db.query.orderItems.findFirst({
        where: eq(orderItems.id, r.orderItemId),
      });
      if (!item)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order item not found.",
        });

      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, item.orderId),
      });
      if (!order)
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });

      const p = await ctx.db.query.product.findFirst({
        where: eq(product.id, item.productId),
      });
      if (!p)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found.",
        });

      const u = await ctx.db.query.user.findFirst({
        where: eq(user.id, order.userId),
      });
      if (!u)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

      await ctx.db
        .update(refunds)
        .set({
          status: input.decision,
          managerId: ctx.session.user.id,
        })
        .where(eq(refunds.id, r.id));

      await ctx.db
        .update(product)
        .set({ quantityInStock: p.quantityInStock + item.quantity })
        .where(eq(product.id, p.id));

      await processRefundDecisionEmail({
        to: u.email,
        name: u.name,
        orderId: order.id,
        productName: p.name,
        refundAmount: r.refundAmount,
        decision: input.decision,
      });

      return { ok: true };
    }),
});
