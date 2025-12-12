"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  userId: string;
  comment: string;
  createdAt: string;
  productId: string;
  productName: string;
  productImage?: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const { data: session } = authClient.useSession();

  const { data: fetchedComments } = api.social.getCommentsAdmin.useQuery(
    undefined,
    {
      enabled: !!session,
    },
  );

  const approveCommentMutation = api.social.updateCommentApproval.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  const handleDecision = (id: string, _decision: "approved" | "denied") => {
    setComments((prev) => prev.filter((c) => c.id !== id));

    try {
      approveCommentMutation.mutate({
        commentId: id,
        approved: true,
      });

      toast.success("Comment approved successfully.");
    } catch (err) {
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Unapproved comments</h2>
      <p className="text-muted-foreground text-sm">
        Approve or deny comments before they appear on product pages.
      </p>

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No pending comments.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    User ID: {comment.userId}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Created At: {formatDate(comment.createdAt)}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecision(comment.id, "denied")}
                  >
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDecision(comment.id, "approved")}
                  >
                    Approve
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Product info */}
                <div className="mb-3 flex items-center gap-4">
                  {comment.productImage && (
                    <Image
                      src={comment.productImage}
                      alt={comment.productName}
                      width={48}
                      height={48}
                      className="rounded-md border object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{comment.productName}</p>
                    <p className="text-muted-foreground text-xs">
                      Product ID: {comment.productId}
                    </p>
                  </div>
                </div>

                {/* Comment text */}
                <p className="text-sm">Comment: {comment.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
