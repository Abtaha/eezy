import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  supportAgentProcedure,
} from "@/server/api/trpc";
import { conversation, message, attachments } from "@/server/db/schema"; // Import attachments
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

  const user = ctx.session?.user;
  const currentSessionId = ctx.session?.session?.id;

  if (user?.role === "supportAgent") {
    if (conv.agentId !== user.id && conv.agentId !== null) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Conversation assigned to another agent",
      });
    }
    return conv;
  }

  if (user) {
    if (conv.userId === user.id) return conv;
    if (currentSessionId && conv.sessionId === currentSessionId) return conv;
  }

  if (conv.sessionId) {
    if (conv.sessionId !== currentSessionId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Session mismatch" });
    }
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
      with: {
        user: true,
        agent: true,
        // We probably don't need full message history in a list view,
        // but if you do, ensure you fetch attachments too:
        messages: {
          with: { attachments: true },
          limit: 1, // Example: get only last message
          orderBy: (m) => desc(m.createdAt),
        },
      },
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
        cursor: z.string().uuid().optional(),
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
        with: {
          attachments: true, // UPDATED: Fetch the new relation
        },
        limit: input.limit,
      });

      return {
        items: messages.reverse(),
        nextCursor: messages.at(-1)?.id ?? null,
      };
    }),

  sendMessage: publicProcedure
    .input(
      z
        .object({
          conversationId: z.string().uuid(),
          content: z.string().optional(),
          // UPDATED: Input now accepts an array of files with metadata
          files: z
            .array(
              z.object({
                url: z.string().url(),
                type: z.string().optional(),
                name: z.string().optional(),
                size: z.number().optional(),
              }),
            )
            .max(5, "Maximum 5 files per message")
            .optional()
            .default([]),
        })
        .refine((v) => v.content || v.files.length > 0, {
          message: "Message must have content or at least one file",
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx?.session?.user;

      const conv = await assertConversationAccess({
        ctx,
        conversationId: input.conversationId,
      });

      const senderType = user?.role === "supportAgent" ? "agent" : "user";

      return await ctx.db.transaction(async (tx) => {
        const [newMessage] = await tx
          .insert(message)
          .values({
            conversationId: conv.id,
            senderType,
            content: input.content,
          })
          .returning();

        if (!newMessage) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        let insertedAttachments: (typeof attachments.$inferSelect)[] = [];

        if (input.files.length > 0) {
          insertedAttachments = await tx
            .insert(attachments)
            .values(
              input.files.map((file) => ({
                messageId: newMessage.id, // Link to the new message
                url: file.url,
                type: file.type,
                name: file.name,
                size: file.size,
              })),
            )
            .returning();
        }

        // 3. Combine them for the return value & Ably
        const fullMessagePayload = {
          ...newMessage,
          attachments: insertedAttachments,
        };

        await ablyService.publish(
          `conversation:${conv.id}`,
          "message.new",
          fullMessagePayload,
        );

        return fullMessagePayload;
      });
    }),

  getChatUserDetails: supportAgentProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // 1. Get the User ID from the conversation
      const conv = await ctx.db.query.conversation.findFirst({
        where: (c) => eq(c.id, input.conversationId),
        columns: { userId: true },
      });

      if (!conv || !conv.userId) return null;

      // 2. Fetch EVERYTHING about the user
      const userDetails = await ctx.db.query.user.findFirst({
        where: (u) => eq(u.id, conv.userId!),
        with: {
          // A. Active Cart
          cart: {
            with: {
              items: {
                orderBy: (ci) => desc(ci.addedAt),
                with: {
                  product: true,
                },
              },
            },
          },
          // B. Order History (Deep nested fetch)
          orders: {
            orderBy: (o) => desc(o.createdAt),
            with: {
              orderItems: {
                with: {
                  product: true,
                  refunds: true,
                },
              },
            },
          },
          // C. Wishlist
          wishlists: {
            with: {
              items: {
                orderBy: (wi) => desc(wi.addedAt),
                with: {
                  product: true,
                },
              },
            },
          },
        },
      });

      return userDetails;
    }),

  getStatus: publicProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversation.findFirst({
        where: (c) => eq(c.id, input.conversationId),
        columns: {
          status: true,
        },
      });

      if (!conv) return null;
      return conv;
    }),

  isUserAttached: supportAgentProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversation.findFirst({
        where: (c) => eq(c.id, input.conversationId),
        columns: {
          userId: true,
        },
      });

      if (!conv) return null;
      return conv.userId !== null ? true : false;
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
