import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        homeAddress: true,
        taxID: true,
      },
    });

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return profile;
  }),

  updateAddress: protectedProcedure
    .input(
      z.object({
        address: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const loggedUser = ctx.session.user;

      if (!loggedUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.db
        .update(user)
        .set({ homeAddress: input.address, updatedAt: new Date() })
        .where(eq(user.id, loggedUser.id));

      return { ok: true };
    }),
});
