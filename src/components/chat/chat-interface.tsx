"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "src/trpc/react";
import { Loader2, Lock, RotateCcw } from "lucide-react"; // Added RotateCcw
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Added Button
import { ablyClient } from "@/lib/ably-client";
import type { Message } from "ably";
import { cn } from "@/lib/utils";

import { AttachmentPreview } from "@/components/chat/attachment-preview";
import { ChatInput } from "@/components/chat/chat-input";

interface ChatInterfaceProps {
  conversationId: string;
  className?: string;
  onReset?: () => void; // New prop
}

export const ChatInterface = ({
  conversationId,
  className,
  onReset,
}: ChatInterfaceProps) => {
  const utils = api.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatClosed, setIsChatClosed] = useState(false);

  // --- Data Fetching ---
  const { data: messagesData, isLoading } =
    api.conversation.getMessages.useQuery(
      { conversationId },
      { enabled: !!conversationId },
    );

  const sendMessage = api.conversation.sendMessage.useMutation({
    onSuccess: () => {
      void utils.conversation.getMessages.invalidate({ conversationId });
    },
    onError: (err) => toast.error("Failed to send: " + err.message),
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
      if (message.name === "message.new") {
        const newMessage = message.data;
        utils.conversation.getMessages.setData(
          { conversationId },
          (oldData) => {
            if (!oldData) return { items: [newMessage], nextCursor: null };
            if (oldData.items.some((m) => m.id === newMessage.id))
              return oldData;
            return { ...oldData, items: [...oldData.items, newMessage] };
          },
        );
      }

      if (message.name === "conversation.closed") {
        setIsChatClosed(true);
      }
    };

    void channel.subscribe(onMessage);

    return () => {
      void channel.unsubscribe();
    };
  }, [conversationId, utils]);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Support Chat
          </h3>
          <p className="text-xs text-zinc-500">
            Ticket #{conversationId.slice(0, 8)}
          </p>
        </div>
        {/* Reset button in header if closed */}
        {isChatClosed && onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-6 w-6"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {messagesData?.items.map((msg) => {
          const isAgent = msg.senderType === "agent";
          const isUser = !isAgent;

          return (
            <div
              key={msg.id}
              className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
            >
              <div
                className={cn(
                  "flex max-w-[85%] flex-col",
                  isAgent ? "items-start" : "items-end",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-sm",
                    isAgent
                      ? "rounded-tl-none bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      : "rounded-tr-none bg-blue-600 text-white",
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
                          isUser={isUser}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="mt-1 px-1 text-[10px] text-zinc-400">
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

      {/* Input or Closed State */}
      {isChatClosed ? (
        <div className="border-t border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-500">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-medium">This ticket is closed.</p>
            </div>
            {onReset && (
              <Button
                onClick={onReset}
                size="sm"
                variant="outline"
                className="mt-2 w-full"
              >
                Start New Ticket
              </Button>
            )}
          </div>
        </div>
      ) : (
        <ChatInput
          isSending={sendMessage.isPending}
          onSendMessage={(content, files) => {
            sendMessage.mutate({
              conversationId,
              content: content || undefined,
              files,
            });
          }}
        />
      )}
    </div>
  );
};
