import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { wishlist, wishlistItem } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const wishlistRouter = createTRPCRouter({
  getMyWishlist: protectedProcedure.query(async ({ ctx }) => {
    const wl = await ctx.db.query.wishlist.findFirst({
      where: eq(wishlist.userId, ctx.session.user.id),
      with: {
        items: {
          with: {
            product: {
              with: {
                ratings: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!wl) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      ...wl,
      items: wl.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          rating:
            item.product.ratings.length > 0
              ? item.product.ratings
                  .map((rating) => rating.rating)
                  .reduce((a, b) => a + b, 0) / item.product.ratings.length
              : 0,
          category: item.product.category.name,
        },
      })),
    };
  }),

  addItem: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      let wl = await ctx.db.query.wishlist.findFirst({
        where: eq(wishlist.userId, userId),
      });

      if (!wl) {
        const [created] = await ctx.db
          .insert(wishlist)
          .values({ userId })
          .returning();

        if (!created)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create wishlist",
          });
        wl = created;
      }

      const existing = await ctx.db.query.wishlistItem.findFirst({
        where: and(
          eq(wishlistItem.wishlistId, wl.id),
          eq(wishlistItem.productId, input.productId),
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Product already in wishlist",
        });
      }

      await ctx.db.insert(wishlistItem).values({
        wishlistId: wl.id,
        productId: input.productId,
      });

      return { success: true };
    }),

  removeItem: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const wl = await ctx.db.query.wishlist.findFirst({
        where: eq(wishlist.userId, ctx.session.user.id),
      });

      if (!wl) return { success: true };

      await ctx.db
        .delete(wishlistItem)
        .where(
          and(
            eq(wishlistItem.wishlistId, wl.id),
            eq(wishlistItem.productId, input.productId),
          ),
        );
    }),

  clearMyWishlist: protectedProcedure.mutation(async ({ ctx }) => {
    const wl = await ctx.db.query.wishlist.findFirst({
      where: eq(wishlist.userId, ctx.session.user.id),
    });

    if (!wl) return { success: true };

    await ctx.db.delete(wishlistItem).where(eq(wishlistItem.wishlistId, wl.id));
  }),
});
