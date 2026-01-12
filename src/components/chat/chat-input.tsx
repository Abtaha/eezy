"use client";

import React, { useState } from "react";
import { UploadButton } from "src/lib/uploadthing";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Send, Paperclip, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type UploadedFile = {
  url: string;
  type: string;
  name: string;
  size: number;
};

interface ChatInputProps {
  onSendMessage: (content: string, files: UploadedFile[]) => void;
  isSending: boolean;
  className?: string;
}

export const ChatInput = ({
  onSendMessage,
  isSending,
  className,
}: ChatInputProps) => {
  const [messageText, setMessageText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleSend = () => {
    if (!messageText.trim() && uploadedFiles.length === 0) return;

    onSendMessage(messageText, uploadedFiles);

    // Clear local state
    setMessageText("");
    setUploadedFiles([]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {/* File Preview List (Staging) */}
      {uploadedFiles.length > 0 && (
        <div className="animate-in slide-in-from-bottom-2 mb-3 flex flex-wrap gap-2">
          {uploadedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 py-1.5 pr-2 pl-3 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {file.type.startsWith("image") ? (
                <ImageIcon className="h-3 w-3" />
              ) : (
                <Paperclip className="h-3 w-3" />
              )}
              <span className="max-w-[120px] truncate font-medium">
                {file.name}
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="ml-1 rounded-full bg-zinc-200 p-0.5 text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Controls */}
      <div className="flex items-end gap-2">
        <div className="relative pb-1">
          <UploadButton
            endpoint="chatMediaUploader"
            appearance={{
              button:
                "bg-transparent text-gray-300 hover:text-white w-9 h-9 p-0 rounded-full ",
              allowedContent: "hidden",
            }}
            content={{ button: <Paperclip className="h-5 w-5" /> }}
            onClientUploadComplete={(res) => {
              if (res) {
                const files: UploadedFile[] = res.map((file) => ({
                  url: file.ufsUrl || file.url,
                  type: file.type || "application/octet-stream",
                  name: file.name,
                  size: file.size,
                }));
                setUploadedFiles((prev) => [...prev, ...files]);
              }
            }}
          />
        </div>

        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[44px] flex-1 bg-zinc-50 dark:bg-zinc-800/50"
        />

        <Button
          onClick={handleSend}
          disabled={
            isSending || (!messageText.trim() && uploadedFiles.length === 0)
          }
          size="icon"
          className="h-11 w-11 shrink-0 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
