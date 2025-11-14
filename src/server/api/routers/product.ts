import {z} from "zod";
import {product} from "@/server/db/schema";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
    get: publicProcedure
        .input(z.object({ id: z.string().uuid() })) //get input uuid
        .query( async ({ ctx, input }) => { //query to get product by uuid
            const awaitedproduct = await ctx.db.query.product.findFirst({ //find the first matching product (since uuid is unique and there will only be 1)
                where: eq(product.id, input.id), //check if the product uuid matches the input uuid
        });

        if (!awaitedproduct) {
            throw new Error("Product not found"); //throw error if no product with that uuid is found
        }

        return awaitedproduct; //return the found product
        }),

    getAll: publicProcedure
        .query( async ({ ctx }) => { //query to get all products
            const awaitedproductsarray = await ctx.db.query.product.findMany(); //find all products
        return awaitedproductsarray; //return the array of products
        }),

    delete: protectedProcedure
        .input(z.object({ productid: z.string().uuid(), userid: z.string().uuid() })) //get input uuid's
        .mutation( async ({ ctx, input }) => {
            await ctx.db.delete(product).where(eq(product.id, input.productid)); //delete the product with the matching uuid
        }),

    create: protectedProcedure
        .input(z.object({ 
            productId: z.string().uuid(), 
            productName: z.string(), 
            productModel: z.string(),
            productDescription: z.string(),
        }))
        .mutation( async ({ ctx, input }) => {

        }),
});