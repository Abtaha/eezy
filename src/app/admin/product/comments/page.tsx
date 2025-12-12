"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";

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

const initialComments: Comment[] = [
  {
    id: "1",
    userId: "111",
    comment: "Perfect!",
    createdAt: "2025-12-06T13:00:00+03:00",
    productId: "121212",
    productName: "Black Hoodie",
    productImage: "/store-images/hoodie-black-front.jpg",
  },
  {
    id: "2",
    userId: "222",
    comment: "Bad quality",
    createdAt: "2025-12-05T15:30:00+03:00",
    productId: "123123",
    productName: "Cargo Pants",
    productImage: "/store-images/cargo-black-front.jpg",
  },
];

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleDecision = (id: string, _decision: "approved" | "denied") => {
    // later call real router, for now just remove from list
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Unapproved comments</h2>
      <p className="text-sm text-muted-foreground">
        Approve or deny comments before they appear on product pages.
      </p>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No pending comments.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">User ID: {comment.userId}</p>
                  <p className="text-xs text-muted-foreground">
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
                <div className="flex items-center gap-4 mb-3">
                  {comment.productImage && (
                    <Image
                      src={comment.productImage}
                      alt={comment.productName}
                      width={48}
                      height={48}
                      className="rounded-md object-cover border"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {comment.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
