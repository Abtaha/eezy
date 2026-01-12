"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { ChatInterface } from "./chat-interface";
import { Button } from "@/components/ui/button";
import { ablyClient } from "@/lib/ably-client";
import type { Message } from "ably";
import { toast } from "sonner";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // 1. Load ID from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("support_conversation_id");
      if (savedId) {
        setActiveConversationId(savedId);
      }
    }
  }, []);

  // 2. Status Check Query
  const {
    data: conversationStatus,
    isLoading: isCheckingStatus,
    refetch: refetchStatus, // Get the refetch function
  } = api.conversation.getStatus.useQuery(
    { conversationId: activeConversationId ?? "" }, // Safe fallback for types
    {
      enabled: !!activeConversationId,
      retry: false,
      refetchOnWindowFocus: true,
    },
  );

  // 3. Force Refetch on Open
  useEffect(() => {
    if (isOpen && activeConversationId) {
      void refetchStatus();
    }
  }, [isOpen, activeConversationId, refetchStatus]);

  // 4. Handle Status Logic (Clear if closed)
  useEffect(() => {
    // Helper to clear state
    const clearState = () => {
      localStorage.removeItem("support_conversation_id");
      setActiveConversationId(null);
    };

    if (conversationStatus?.status === "closed") {
      clearState();
    } else if (
      activeConversationId &&
      conversationStatus === null &&
      !isCheckingStatus
    ) {
      // ID exists locally but not in DB
      clearState();
    }
  }, [conversationStatus, activeConversationId, isCheckingStatus]);

  // 5. Ably Listener
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = ablyClient.channels.get(
      `conversation:${activeConversationId}`,
    );

    const onMessage = (message: Message) => {
      if (message.name === "conversation.closed") {
        toast.info("Conversation ended by agent");
        localStorage.removeItem("support_conversation_id");
        setActiveConversationId(null);
      }
    };

    void channel.subscribe("conversation.closed", onMessage);

    return () => {
      void channel.unsubscribe();
    };
  }, [activeConversationId]);

  const createConversation = api.conversation.create.useMutation({
    onSuccess: (data) => {
      setActiveConversationId(data.id);
      localStorage.setItem("support_conversation_id", data.id);
    },
  });

  const handleOpen = () => {
    setIsOpen(true);
    // Only create if we strictly don't have an ID
    if (
      !activeConversationId &&
      !isCheckingStatus &&
      !createConversation.isPending
    ) {
      createConversation.mutate();
    }
  };

  // 6. Manual Reset Handler (Passed to Child)
  const handleManualReset = () => {
    localStorage.removeItem("support_conversation_id");
    setActiveConversationId(null);
    createConversation.mutate(); // Immediately start a new one
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="animate-in slide-in-from-bottom-5 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-950">
          {activeConversationId && !isCheckingStatus ? (
            <ChatInterface
              conversationId={activeConversationId}
              onReset={handleManualReset} // Pass the reset handler
              className="h-full rounded-none border-0 shadow-none"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-gray-500">
                {isCheckingStatus
                  ? "Verifying session..."
                  : "Starting secure chat..."}
              </span>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        size="icon"
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>
    </div>
  );
};
