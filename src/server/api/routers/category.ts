import * as z from "zod";
import { createTRPCRouter } from "@/server/api/trpc";
import { productManagerProcedure } from "@/server/api/trpc";
import { category } from "@/server/db/schema";

export const categoryRouter = createTRPCRouter({
  getAll: productManagerProcedure.query(async ({ ctx }) => {
    const allCategories = await ctx.db.query.category.findMany({
      columns: {
        name: true,
      },
    });

    return allCategories;
  }),

  create: productManagerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newCategory = await ctx.db
        .insert(category)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning();

      return newCategory[0];
    }),
});
