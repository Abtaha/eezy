"use client";
import React from "react";
import ChatCard from "src/components/admin/chat-card";

// Dummy data for now
const dummyChats = [
  {
    id: "1",
    username: "john_doe",
    isGuest: false,
    lastMessage: "Hi, I need help with my order",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    username: null,
    isGuest: true,
    lastMessage: "How do I track my package?",
    timestamp: "5 min ago",
  },
  {
    id: "3",
    username: "sarah_92",
    isGuest: false,
    lastMessage: "Thank you for your help!",
    timestamp: "10 min ago",
  },
  {
    id: "4",
    username: null,
    isGuest: true,
    lastMessage: "Is this product still available?",
    timestamp: "15 min ago",
  },
  {
    id: "5",
    username: "mike_wilson",
    isGuest: false,
    lastMessage: "I want to return an item",
    timestamp: "1 hour ago",
  },
];

export default function SupportAgentPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Support Chats</h1>
          <p className="mt-2 text-gray-600">
            Click on a chat to view and respond to messages
          </p>
        </div>

        {/* Chat List */}
        <div className="flex flex-col gap-4">
          {dummyChats.map((chat) => (
            <ChatCard
              key={chat.id}
              id={chat.id}
              username={chat.username}
              isGuest={chat.isGuest}
              lastMessage={chat.lastMessage}
              timestamp={chat.timestamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
