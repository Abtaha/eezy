import { productRouter } from "@/server/api/routers/product";
import { cartRouter } from "@/server/api/routers/cart";
import { orderRouter } from "@/server/api/routers/order";
import { socialRouter } from "@/server/api/routers/social";
import { wishlistRouter } from "@/server/api/routers/wishlist";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  social: socialRouter,
  wishlist: wishlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
