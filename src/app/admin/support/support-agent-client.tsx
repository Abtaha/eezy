"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Added router
import ChatCard from "src/components/admin/chat-card";
import { ablyClient } from "@/lib/ably-client";
import { api } from "@/trpc/react"; // Added API
import { toast } from "sonner"; // Added Toast
import { Loader2 } from "lucide-react";

import type { Message } from "ably";
import { type AppRouter } from "@/server/api/root";
import { type inferProcedureOutput } from "@trpc/server";

type Conversation = inferProcedureOutput<
  AppRouter["conversation"]["list"]
>[number];

interface Props {
  initialConversations: Conversation[];
}

export default function SupportAgentClient({ initialConversations }: Props) {
  const router = useRouter();
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);

  // State to track which conversation is currently being assigned (loading state)
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const assignMutation = api.conversation.assign.useMutation({
    onSuccess: (data) => {
      // Once assigned, navigate to the chat
      router.push(`/admin/support/chat/${data.id}`);
    },
    onError: (err) => {
      toast.error("Could not assign ticket: " + err.message);
      setAssigningId(null);
    },
  });

  const handleChatClick = (conversation: Conversation) => {
    // If already assigned to someone (presumably me, since list filters typically show mine + unassigned)
    if (conversation.agentId) {
      router.push(`/admin/support/chat/${conversation.id}`);
      return;
    }

    // If unassigned, auto-assign to me first
    setAssigningId(conversation.id);
    assignMutation.mutate({ conversationId: conversation.id });
  };

  useEffect(() => {
    if (!ablyClient) return;

    const channel = ablyClient.channels.get("support:conversations");

    const handler = (msg: Message) => {
      switch (msg.name) {
        case "conversation.created": {
          const conv = msg.data as Conversation;
          // Add new conversation to top
          setConversations((prev) => {
            if (prev.find((c) => c.id === conv.id)) return prev;
            return [conv, ...prev];
          });
          break;
        }

        case "conversation.assigned": {
          const data = msg.data as {
            conversationId: string;
            agentId: string;
          };

          setConversations((prev) =>
            prev.map((c) =>
              c.id === data.conversationId
                ? { ...c, agentId: data.agentId }
                : c,
            ),
          );
          break;
        }

        case "conversation.closed": {
          const conv = msg.data as Conversation;
          setConversations((prev) => prev.filter((c) => c.id !== conv.id));
          break;
        }
      }
    };

    channel.subscribe(handler);

    return () => {
      channel.unsubscribe(handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Support Chats</h1>
          <p className="mt-2 text-gray-600">
            Click on a chat to auto-assign and respond
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {conversations.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No active tickets found. Good job!
            </div>
          )}

          {conversations.map((conversation) => {
            const isUnassigned = conversation.agentId === null;
            const isProcessing = assigningId === conversation.id;

            return (
              <div
                key={conversation.id}
                className="group relative cursor-pointer transition-transform hover:-translate-y-0.5"
                onClick={() => !isProcessing && handleChatClick(conversation)}
              >
                {/* Status Badge */}
                <div
                  className={`absolute top-4 right-4 z-10 rounded-full px-2 py-1 text-xs font-semibold ${
                    isUnassigned
                      ? "border border-green-200 bg-green-100 text-green-700"
                      : "border border-purple-200 bg-purple-100 text-purple-700"
                  }`}
                >
                  {isUnassigned ? "Unassigned" : "Assigned"}
                </div>

                {/* Loading Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                )}

                <ChatCard
                  id={conversation.id}
                  username={conversation.user?.name ?? "Guest User"} // Updated to use relation if available
                  isGuest={!conversation.userId}
                  lastMessage={
                    conversation.messages?.[0]?.content ??
                    (conversation.messages?.[0]?.attachments?.length
                      ? "Sent an attachment"
                      : "No messages")
                  }
                  timestamp={new Date(conversation.updatedAt).toLocaleString()}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
