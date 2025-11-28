import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { cart, cartItem } from "@/server/db/schema";

export const cartRouter = createTRPCRouter({
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    let userCart = await db.query.cart.findFirst({
      where: eq(cart.userID, session.user.id),
      with: {
        items: {
          with: {
            product: true,
          },
          orderBy: (items, { desc }) => [desc(items.addedAt)],
        },
      },
    });

    if (!userCart) {
      const [newCart] = await db
        .insert(cart)
        .values({ userID: session.user.id })
        .returning();

      return {
        ...newCart,
        items: [],
      };
    }

    return userCart;
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().min(1).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      let userCart = await db.query.cart.findFirst({
        where: eq(cart.userID, session.user.id),
      });

      if (!userCart) {
        [userCart] = await db
          .insert(cart)
          .values({ userID: session.user.id })
          .returning();
      }

      const existingItem = await db.query.cartItem.findFirst({
        where: and(
          eq(cartItem.cartID, userCart!.id),
          eq(cartItem.productID, input.productId),
        ),
      });

      if (existingItem) {
        await db
          .update(cartItem)
          .set({ quantity: existingItem.quantity + input.quantity })
          .where(eq(cartItem.id, existingItem.id));
      } else {
        await db.insert(cartItem).values({
          cartID: userCart!.id,
          productID: input.productId,
          quantity: input.quantity,
        });
      }
    }),

  updateItemQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const userCart = await db.query.cart.findFirst({
        where: eq(cart.userID, session.user.id),
      });

      if (!userCart) return { success: false, message: "Cart not found" };

      if (input.quantity === 0) {
        await db
          .delete(cartItem)
          .where(
            and(
              eq(cartItem.cartID, userCart.id),
              eq(cartItem.productID, input.productId),
            ),
          );
      } else {
        await db
          .update(cartItem)
          .set({ quantity: input.quantity })
          .where(
            and(
              eq(cartItem.cartID, userCart.id),
              eq(cartItem.productID, input.productId),
            ),
          );
      }
    }),

  removeItem: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const userCart = await db.query.cart.findFirst({
        where: eq(cart.userID, session.user.id),
      });

      if (userCart) {
        await db
          .delete(cartItem)
          .where(
            and(
              eq(cartItem.cartID, userCart.id),
              eq(cartItem.productID, input.productId),
            ),
          );
      }
    }),

  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, session } = ctx;

    const userCart = await db.query.cart.findFirst({
      where: eq(cart.userID, session.user.id),
    });

    if (userCart) {
      await db.delete(cartItem).where(eq(cartItem.cartID, userCart.id));
    }
  }),

  getItemCount: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const userCart = await db.query.cart.findFirst({
      where: eq(cart.userID, session.user.id),
    });

    if (!userCart) return 0;

    const result = await db
      .select({ count: sql<number>`sum(${cartItem.quantity})` })
      .from(cartItem)
      .where(eq(cartItem.cartID, userCart.id));

    return Number(result[0]?.count ?? 0);
  }),

  mergeCart: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().uuid(),
          quantity: z.number().min(1),
        }),
      ),
    )
    .mutation(async ({ ctx, input: localItems }) => {
      const { db, session } = ctx;

      let userCart = await db.query.cart.findFirst({
        where: eq(cart.userID, session.user.id),
      });

      if (!userCart) {
        [userCart] = await db
          .insert(cart)
          .values({ userID: session.user.id })
          .returning();
      }

      if (!userCart) throw new Error("Failed to create cart");

      await db.transaction(async (tx) => {
        for (const localItem of localItems) {
          const existingDbItem = await tx.query.cartItem.findFirst({
            where: and(
              eq(cartItem.cartID, userCart!.id),
              eq(cartItem.productID, localItem.id),
            ),
          });

          if (existingDbItem) {
            await tx
              .update(cartItem)
              .set({ quantity: existingDbItem.quantity + localItem.quantity })
              .where(eq(cartItem.id, existingDbItem.id));
          } else {
            await tx.insert(cartItem).values({
              cartID: userCart!.id,
              productID: localItem.id,
              quantity: localItem.quantity,
            });
          }
        }
      });
    }),
});
