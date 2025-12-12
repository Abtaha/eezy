import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  productManagerProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";
import {
  product,
  ratings,
  comments,
  orders,
  orderItems,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { timestamp } from "drizzle-orm/gel-core";

//helper function that checks if user has the product delivered
async function productDeliveredToUser(userID: string, productID: string) {
  //Check if product exists
  const productExists = await db
    .select()
    .from(product)
    .where(eq(product.id, productID));

  if (productExists.length == 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Product ${productID} not found`,
    });
  }

  //get delivered products of the user
  const deliveredProducts = await db
    .select()
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId)) //check corresponding order items
    .where(
      and(
        eq(orders.userId, userID),
        eq(orders.status, "delivered"),
        eq(orderItems.productId, productID),
      ),
    );
  return deliveredProducts.length > 0;
}

export const socialRouter = createTRPCRouter({
  canRate: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const mayRate = await productDeliveredToUser(userId, input.productId);

      return mayRate;
    }),

  addRating: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        rating: z.number().min(1).max(5), // Rating between 1 and 5
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const mayRate = await productDeliveredToUser(userId, input.productId);

      if (!mayRate) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `User has not received product ${input.productId}.`,
        });
      }

      //insert rating into db
      const newRating = await db
        .insert(ratings)
        .values({
          userId: userId,
          productId: input.productId,
          rating: input.rating,
        })
        .returning();

      return newRating[0];
    }),

  getAverageRating: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ratingsForProduct = await db
        .select()
        .from(ratings)
        .where(eq(ratings.productId, input.productId));

      const sum = ratingsForProduct.reduce((acc, curr) => acc + curr.rating, 0);

      return sum / ratingsForProduct.length;
    }),

  getCommentsAdmin: productManagerProcedure.query(async ({ ctx, input }) => {
    const commentsForProduct = await ctx.db.query.comments.findMany({
      where: eq(comments.approved, false),
      with: {
        product: true,
        user: true,
      },
    });

    return commentsForProduct.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      comment: comment.comment,
      createdAt: new Date(comment.createdAt).toLocaleString(),
      productId: comment.productId,
      productName: comment.product.name,
      productImage: comment.product.frontImage,
    }));
  }),

  updateCommentApproval: productManagerProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        approved: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(comments)
        .set({ approved: input.approved })
        .where(eq(comments.id, input.commentId));
    }),

  getComments: publicProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const commentsForProduct = await ctx.db.query.comments.findMany({
        where: and(
          eq(comments.productId, input.productId),
          eq(comments.approved, true),
        ),
        with: {
          product: true,
          user: true,
        },
      });

      return commentsForProduct.map((comment) => ({
        id: comment.id,
        authorName: comment.user.name,
        authorInitial: comment.user.name.charAt(0),
        avatarColor: comment.user.email.includes("@gmail.com")
          ? "bg-blue-500"
          : "bg-green-500",
        text: comment.comment,
        timestamp: new Date(comment.createdAt).toLocaleString(),
      }));
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        comment: z.string().min(1).max(1000), // Comment text between 1 and 1000 characters
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const mayComment = await productDeliveredToUser(userId, input.productId);

      if (!mayComment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `User has not received product ${input.productId}.`,
        });
      }

      //insert comment into db
      const newComment = await db
        .insert(comments)
        .values({
          userId: userId,
          productId: input.productId,
          comment: input.comment,
          approved: false, //Comment needs approval by default
        })
        .returning();

      return newComment[0];
    }),
});
