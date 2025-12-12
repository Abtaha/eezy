import { z } from "zod";
import { product } from "@/server/db/schema";
import { and, ne, eq } from "drizzle-orm/sql/expressions/conditions";
import { randomUUID } from "crypto";
import { ilike } from "drizzle-orm";

import {
  createTRPCRouter,
  productManagerProcedure,
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
        with: {
          ratings: true,
        },
      });

      if (!awaitedproduct) {
        throw new Error("Product not found"); //throw error if no product with that uuid is found
      }

      return {
        ...awaitedproduct,
        rating:
          awaitedproduct.ratings.length > 0
            ? awaitedproduct.ratings
                .map((rating) => rating.rating)
                .reduce((a, b) => a + b, 0) / awaitedproduct.ratings.length
            : 0,
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const awaitedproductsarray = await ctx.db.query.product.findMany({
      with: {
        ratings: true,
      },
    }); //find all products

    return awaitedproductsarray.map((product) => ({
      ...product,
      rating:
        product.ratings.length > 0
          ? product.ratings
              .map((rating) => rating.rating)
              .reduce((a, b) => a + b, 0) / product.ratings.length
          : 0,
    }));
  }),

  delete: productManagerProcedure
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

  create: productManagerProcedure
    .input(
      z.object({
        productName: z.string(),
        productModel: z.string(),
        productDescription: z.string().optional() ?? "", //empty string if no description provided
        productQuantityInStock: z.number().int().nonnegative(), //ensure non-negative integer for stock quantity
        productCategory: z.string(),
        productPrice: z.number().int().max(9999999999), // to ensure a maximum of 10 digits as in the product schema
        productWarrantyStatus: z.boolean(),
        productFrontImage: z.string(),
        productBackImage: z.string(),
        productDistributor: z.string(),
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
          category: input.productCategory,
          quantityInStock: input.productQuantityInStock,
          price: (input.productPrice * 0.01).toFixed(2), //convert to string in 2-digits-after-decimal format
          warrantyStatus: input.productWarrantyStatus,
          frontImage: input.productFrontImage,
          backImage: input.productBackImage,
          distributor: input.productDistributor,
        })
        .returning();

      return newProduct[0];
    }),

  search: publicProcedure
    .input(z.object({ querystring: z.string() }))
    .query(async ({ ctx, input }) => {
      const q = `%${input.querystring}%`;

      // search by name
      const searchByName = await ctx.db.query.product.findMany({
        where: ilike(product.name, q),
      });

      // search by description
      const searchByDescription = await ctx.db.query.product.findMany({
        where: ilike(product.description, q),
      });

      // remove duplicates using a Map keyed by product.id
      const uniqueMap = new Map<string, (typeof searchByName)[number]>();

      [...searchByName, ...searchByDescription].forEach((item) => {
        uniqueMap.set(item.id, item); // if same id appears twice → overwrites → unique
      });

      return Array.from(uniqueMap.values()); // array of unique results
    }),

  getRelated: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        limit: z.number().int().min(1),
        category: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const relatedProducts = await ctx.db.query.product.findMany({
        where: and(
          eq(product.category, input.category),
          ne(product.id, input.id),
        ),
        limit: input.limit,
      });

      return relatedProducts;
    }),
});
