import { z } from "zod";
import { product } from "@/server/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { randomUUID } from "crypto";
import { ilike } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string().uuid() })) //get input uuid
    .query(async ({ ctx, input }) => {
      //query to get product by uuid
      const awaitedproduct = await ctx.db.query.product.findFirst({
        //find the first matching product (since uuid is unique and there will only be 1)
        where: eq(product.id, input.id), //check if the product uuid matches the input uuid
      });

      if (!awaitedproduct) {
        throw new Error("Product not found"); //throw error if no product with that uuid is found
      }

      return awaitedproduct; //return the found product
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    //query to get all products
    const awaitedproductsarray = await ctx.db.query.product.findMany(); //find all products
    return awaitedproductsarray; //return the array of products
  }),

  delete: protectedProcedure
    .input(
      z.object({ productid: z.string().uuid(), userid: z.string().uuid() }),
    ) //get input uuid's
    .mutation(async ({ ctx, input }) => {
      const deletedproduct = await ctx.db.query.product.findFirst({
        where: eq(product.id, input.productid),
      }); // find the product to be deleted

      if (!deletedproduct) {
        throw new Error("Product not found"); //throw error if no product with that uuid is found
      }

      await ctx.db.delete(product).where(eq(product.id, input.productid)); //delete the product if found
    }),

  create: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        productModel: z.string(),
        productDescription: z.string().optional() ?? "", //empty string if no description provided
        productQuantityInStock: z.number().int().nonnegative(), //ensure non-negative integer for stock quantity
        productPrice: z.number().int().max(9999999999), // to ensure a maximum of 10 digits as in the product schema
        productWarrantyStatus: z.boolean(),
        productFrontImage: z.string(),
        productBackImage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newProduct = await ctx.db
        .insert(product)
        .values({
          id: randomUUID(), //generate a new uuid for the product
          name: input.productName,
          model: input.productModel,
          description: input.productDescription,
          quantityInStock: input.productQuantityInStock,
          price: (input.productPrice * 0.01).toFixed(2), //convert to string in 2-digits-after-decimal format
          warrantyStatus: input.productWarrantyStatus,
          frontImage: input.productFrontImage,
          backImage: input.productBackImage,
        })
        .returning();

      return newProduct[0];
    }),

  search: publicProcedure
    .input(z.object({ querystring: z.string() }))
    .query(async ({ ctx, input }) => {
      const searchByName = await ctx.db.query.product.findMany({
        where: ilike(product.name, `%${input.querystring}%`), //case-insensitive search for products with names matching the query string
      });
      const searchByDescription = await ctx.db.query.product.findMany({
        where: ilike(product.description, `%${input.querystring}%`), //case-insensitive search for products with descriptions matching the query string
      });
      return searchByName.concat(searchByDescription); //return combined array of products found first by name and then by description
    }),
});

