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
            product: true,
          },
        },
      },
    });

    return wl ?? { items: [] };
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
