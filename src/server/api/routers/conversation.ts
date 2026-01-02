import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  supportAgentProcedure,
} from "@/server/api/trpc";
import { conversation, message } from "@/server/db/schema";
import { lt, or, eq, and, isNull, desc } from "drizzle-orm";
import ablyService from "@/server/services/ably";

import { TRPCError } from "@trpc/server";
import { createTRPCContext } from "@/server/api/trpc";

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

async function assertConversationAccess({
  ctx,
  conversationId,
}: {
  ctx: TRPCContext;
  conversationId: string;
}) {
  const conv = await ctx.db.query.conversation.findFirst({
    where: (c) => eq(c.id, conversationId),
  });

  if (!conv) throw new TRPCError({ code: "NOT_FOUND" });
  if (conv.status === "closed") throw new TRPCError({ code: "FORBIDDEN" });

  const user = ctx.session?.user;

  if (user?.role === "supportAgent") {
    if (conv.agentId !== user.id) throw new TRPCError({ code: "FORBIDDEN" });
  } else if (user) {
    if (conv.userId !== user.id) throw new TRPCError({ code: "FORBIDDEN" });
  } else {
    if (conv.sessionId !== ctx?.session?.session.id)
      throw new TRPCError({ code: "FORBIDDEN" });
  }

  return conv;
}

export const conversationRouter = createTRPCRouter({
  create: publicProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session?.user;
    const sessionId = ctx.session?.session.id;

    const [conv] = await ctx.db
      .insert(conversation)
      .values({
        userId: user?.id ?? null,
        sessionId: sessionId ?? null,
        agentId: null,
        status: "open",
      })
      .returning();

    if (!conv) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await ablyService.publish(
      `conversation:${conv.id}`,
      "conversation.created",
      conv,
    );

    return conv;
  }),

  list: supportAgentProcedure.query(async ({ ctx }) => {
    const user = ctx?.session?.user;
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return ctx.db.query.conversation.findMany({
      where: (c) =>
        and(
          eq(c.status, "open"),
          or(eq(c.agentId, user.id), isNull(c.agentId)),
        ),
      orderBy: (c) => desc(c.updatedAt),
    });
  }),

  assign: supportAgentProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const conv = await ctx.db.query.conversation.findFirst({
        where: (c) => eq(c.id, input.conversationId),
      });

      if (!conv) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (conv.agentId) throw new TRPCError({ code: "CONFLICT" });

      const [updated] = await ctx.db
        .update(conversation)
        .set({ agentId: user.id, updatedAt: new Date() })
        .where(
          and(
            eq(conversation.id, input.conversationId),
            isNull(conversation.agentId),
          ),
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Conversation already assigned",
        });
      }

      await ablyService.publish(
        `conversation:${updated.id}`,
        "conversation.assigned",
        { agentId: user.id },
      );

      return updated;
    }),

  getMessages: publicProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        cursor: z.string().uuid().optional(), // for pagination
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertConversationAccess({
        ctx,
        conversationId: input.conversationId,
      });

      const messages = await ctx.db.query.message.findMany({
        where: (m) =>
          and(
            eq(m.conversationId, input.conversationId),
            input.cursor ? lt(m.id, input.cursor) : undefined,
          ),
        orderBy: (m) => desc(m.createdAt),
        limit: input.limit,
      });

      return {
        items: messages.reverse(), // oldest → newest for UI
        nextCursor: messages.at(-1)?.id ?? null,
      };
    }),

  sendMessage: publicProcedure
    .input(
      z
        .object({
          conversationId: z.string().uuid(),
          content: z.string().optional(),
          fileUrl: z.string().optional(),
          fileType: z.string().optional(),
        })
        .refine((v) => v.content || (v.fileUrl && v.fileType), {
          message: "Message must have content or a file",
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx?.session?.user;

      const conv = await assertConversationAccess({
        ctx,
        conversationId: input.conversationId,
      });

      const senderType = user?.role === "supportAgent" ? "agent" : "user";

      const [msg] = await ctx.db
        .insert(message)
        .values({
          conversationId: conv.id,
          senderType,
          content: input.content,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
        })
        .returning();

      await ablyService.publish(`conversation:${conv.id}`, "message.new", msg);

      return msg;
    }),

  close: supportAgentProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversation.findFirst({
        where: (c) => eq(c.id, input.conversationId),
      });

      if (!conv) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (conv.agentId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await ctx.db
        .update(conversation)
        .set({ status: "closed", updatedAt: new Date() })
        .where(eq(conversation.id, input.conversationId))
        .returning();

      if (!updated) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await ablyService.publish(
        `conversation:${updated.id}`,
        "conversation.closed",
        updated,
      );

      return updated;
    }),
});
