// components/comment-section.tsx

"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Comment {
  id: string;
  authorName: string;
  authorInitial: string;
  avatarColor: string;
  text: string;
  timestamp: string;
}

export default function CommentSection({ productId }: { productId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const { data: session } = authClient.useSession();

  const [comments, setComments] = useState<Comment[]>([]);
  const { data: fetchedComments } = api.social.getComments.useQuery(
    { productId: productId ?? "" },
    {
      enabled: !!productId,
    },
  );

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
      console.log(fetchedComments);
    }
  }, [fetchedComments]);

  const submitMutation = api.social.addComment.useMutation({
    onSuccess: () => {
      setText("");
      router.refresh();
    },
  });
  const mayRate = api.social.canRate.useQuery(
    { productId, type: "comment" },
    { enabled: !!session },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim()) return;

    submitMutation.mutate({
      productId,
      comment: text,
    });
    toast.success("Comment added successfully.");
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Comments</h2>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              {/* Avatar Circle */}
              <div
                className={`h-10 w-10 rounded-full ${comment.avatarColor} flex flex-shrink-0 items-center justify-center font-bold text-white`}
              >
                {comment.authorInitial}
              </div>

              {/* Comment Content */}
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {comment.authorName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mayRate.data && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            name="comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="h-12"
            disabled={submitMutation.isPending}
          />
          <button
            type="submit"
            disabled={submitMutation.isPending || !text.trim()}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitMutation.isPending ? "Posting..." : "Add Comment"}
          </button>
        </form>
      )}
    </div>
  );
}

