"use client";
import React from "react";
import Link from "next/link";

interface ChatCardProps {
  id: string;
  username: string | null;
  isGuest: boolean;
  lastMessage?: string;
  timestamp?: string;
}

export default function ChatCard({
  id,
  username,
  isGuest,
  lastMessage,
  timestamp,
}: ChatCardProps) {
  const displayName = isGuest ? "Guest" : username ?? "Guest";

  return (
    <Link href={`/admin/support/chat/${id}`}>
      <div className="cursor-pointer rounded-lg bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-xl">
        <div className="flex items-center gap-4">
          {/* User Avatar/Icon */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
            <span className="text-xl">
              {isGuest ? "👤" : "👨‍💼"}
            </span>
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {displayName}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {timestamp && (
                  <span className="text-xs text-gray-500">{timestamp}</span>
                )}
                {isGuest && (
                  <div className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                    Guest
                  </div>
                )}
              </div>
            </div>
            {lastMessage && (
              <p className="mt-1 truncate text-sm text-gray-600">
                {lastMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
