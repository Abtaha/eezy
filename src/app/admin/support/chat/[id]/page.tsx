"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "src/trpc/react";
import { UploadButton } from "src/lib/uploadthing";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  
  const [messageText, setMessageText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; type: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, refetch } = api.conversation.getMessages.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );

  const sendMessage = api.conversation.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      setUploadedFiles([]);
      void refetch();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const handleSend = () => {
    if (!messageText.trim() && uploadedFiles.length === 0) return;

    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        sendMessage.mutate({
          conversationId,
          content: messageText || undefined,
          fileUrl: file.url,
          fileType: file.type,
        });
      });
    } else {
      sendMessage.mutate({
        conversationId,
        content: messageText,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="border-b bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-semibold">Support Chat</h1>
          <p className="text-sm text-gray-500">Conversation ID: {conversationId}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {messagesData?.items.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === "agent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md rounded-lg p-3 ${
                  msg.senderType === "agent"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-gray-800 shadow"
                }`}
              >
                {msg.content && <p>{msg.content}</p>}
                {msg.fileUrl && (
                  <div className="mt-2">
                    {msg.fileType?.startsWith("image/") ? (
                      <img src={msg.fileUrl} alt="attachment" className="rounded max-w-xs" />
                    ) : (
                      <a
                        href={msg.fileUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 underline"
                      >
                        View file
                      </a>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border-t bg-white p-2">
          <div className="mx-auto max-w-4xl flex flex-wrap gap-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center gap-2 rounded bg-gray-100 px-3 py-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">File {idx + 1}</span>
                  <button onClick={() => removeFile(idx)} className="text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t bg-white p-4">
        <div className="mx-auto max-w-4xl flex items-center gap-2">
          <UploadButton
            endpoint="chatMediaUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                const files = res.map((file) => ({
                  url: file.url,
                  type: file.type,
                }));
                setUploadedFiles((prev) => [...prev, ...files]);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Upload error: ${error.message}`);
            }}
          />
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
