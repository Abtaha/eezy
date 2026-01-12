"use client";

import React, { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import { api } from "src/trpc/react";
import { Button } from "@/components/ui/button"; // Added Button
import { toast } from "sonner";
import { ablyClient } from "@/lib/ably-client";
import type { Message } from "ably";
import { cn } from "@/lib/utils";

import { Loader2, XCircle, User } from "lucide-react";
import Link from "next/link"; // Import this separately

import { AttachmentPreview } from "@/components/chat/attachment-preview";
import { ChatInput } from "@/components/chat/chat-input";
import { B } from "node_modules/better-auth/dist/shared/better-auth.CVb74KJO";

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter(); // Initialize router
  const conversationId = params.id as string;
  const utils = api.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const { data: messagesData, isLoading } =
    api.conversation.getMessages.useQuery(
      { conversationId },
      { enabled: typeof conversationId === "string" },
    );

  const { data: isUserAttached, isLoading: isUserLoading } =
    api.conversation.isUserAttached.useQuery(
      { conversationId },
      { enabled: typeof conversationId === "string" },
    );

  const sendMessage = api.conversation.sendMessage.useMutation({
    onSuccess: () => {
      void utils.conversation.getMessages.invalidate({ conversationId });
    },
    onError: (err) => {
      toast.error("Failed to send: " + err.message);
    },
  });

  // --- Close Chat Mutation ---
  const closeChat = api.conversation.close.useMutation({
    onSuccess: () => {
      toast.success("Conversation closed");
      router.push("/admin"); // Redirect back to list
    },
    onError: (err) => {
      toast.error("Failed to close: " + err.message);
    },
  });

  // --- Scroll Effect ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.items.length]);

  // --- Real-time Subscription ---
  useEffect(() => {
    if (!conversationId) return;

    const channel = ablyClient.channels.get(`conversation:${conversationId}`);

    const onMessage = (message: Message) => {
      const newMessage = message.data;
      utils.conversation.getMessages.setData({ conversationId }, (oldData) => {
        if (!oldData) return { items: [newMessage], nextCursor: null };
        if (oldData.items.some((m) => m.id === newMessage.id)) return oldData;
        return { ...oldData, items: [...oldData.items, newMessage] };
      });
    };

    void channel.subscribe("message.new", onMessage);
    return () => {
      void channel.unsubscribe();
    };
  }, [conversationId, utils]);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="z-10 flex items-center justify-between border-b bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Agent Console
          </h1>
          <p className="text-sm text-gray-500">Ticket ID: {conversationId}</p>
        </div>

        <div className="flex flex-row items-center gap-2">
          {isUserLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : isUserAttached ? (
            <Button size="sm" className="gap-2" asChild>
              <Link
                href={`/admin/support/chat/${conversationId}/user`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>View User Info</span>
              </Link>
            </Button>
          ) : null}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => closeChat.mutate({ conversationId })}
            disabled={closeChat.isPending}
            className="gap-2"
          >
            {closeChat.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Close Chat
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {messagesData?.items.map((msg) => {
            const isAgent = msg.senderType === "agent";
            const isMe = isAgent;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-sm shadow-sm",
                      isMe
                        ? "rounded-br-none bg-purple-600 text-white"
                        : "rounded-bl-none border bg-white text-gray-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-100",
                    )}
                  >
                    {msg.content && (
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        className={cn(
                          "grid gap-2",
                          msg.content ? "mt-3" : "",
                          msg.attachments.length > 1
                            ? "grid-cols-2"
                            : "grid-cols-1",
                        )}
                      >
                        {msg.attachments.map((file) => (
                          <AttachmentPreview
                            key={file.id}
                            file={file}
                            isUser={isMe}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="mt-1 px-1 text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <ChatInput
            isSending={sendMessage.isPending}
            onSendMessage={(content, files) => {
              sendMessage.mutate({
                conversationId,
                content: content || undefined,
                files,
              });
            }}
            className="border-0 p-0 shadow-none dark:bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
