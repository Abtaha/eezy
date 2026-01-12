import React from "react";
import { FileText, PlayCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentPreviewProps {
  file: {
    url: string;
    type?: string | null;
    name?: string | null;
  };
  isUser?: boolean; // Optional: customize styling for sender vs receiver
}

export const AttachmentPreview = ({
  file,
  isUser = false,
}: AttachmentPreviewProps) => {
  const isImage = file.type?.startsWith("image/");
  const isVideo = file.type?.startsWith("video/");

  // Styling logic
  const cardBg = isUser
    ? "bg-white/20 border-white/20"
    : "bg-white border-zinc-200";
  const textColor = isUser ? "text-white" : "text-zinc-700";
  const subTextColor = isUser ? "text-blue-100" : "text-zinc-500";
  const iconBg = isUser
    ? "bg-white/20 text-white"
    : "bg-zinc-100 text-zinc-500";

  if (isImage) {
    return (
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mt-2 block overflow-hidden rounded-lg border border-transparent/10 first:mt-0"
      >
        <img
          src={file.url}
          alt={file.name || "Image"}
          className="max-h-60 w-full rounded-lg bg-zinc-100 object-cover"
        />
      </a>
    );
  }

  if (isVideo) {
    return (
      <div className="relative mt-2 overflow-hidden rounded-lg border border-transparent/10 bg-black first:mt-0">
        <video
          src={file.url}
          className="max-h-60 w-full object-cover opacity-80"
          controls
          preload="metadata"
        />
      </div>
    );
  }

  // Generic File
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "mt-2 flex items-center gap-3 rounded-lg border p-2 transition-colors first:mt-0 hover:bg-black/5",
        cardBg,
      )}
    >
      <div className={cn("rounded p-2", iconBg)}>
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className={cn("truncate text-sm font-medium", textColor)}>
          {file.name || "Attachment"}
        </p>
        <p className={cn("text-[10px] uppercase", subTextColor)}>
          {file.type?.split("/")[1] || "FILE"}
        </p>
      </div>
      <Download className={cn("h-4 w-4 opacity-70", textColor)} />
    </a>
  );
};
