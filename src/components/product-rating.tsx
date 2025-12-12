"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";

interface ProductRatingProps {
  productId: string;
  isLoggedIn: boolean; // Will be connected to auth later
}

export default function ProductRating({
  productId,
  isLoggedIn,
}: ProductRatingProps) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const updateRatingMutation = api.social.addRating.useMutation({
    onSuccess: () => {
      setSelectedRating(null);
      setSubmitted(false);
      router.refresh();
    },
  });

  const { data: mayRate } = api.social.canRate.useQuery(
    { productId, type: "rating" },
    { enabled: !!productId },
  );

  // Don't show if user not logged in
  if (!isLoggedIn) {
    return null;
  }

  if (!mayRate) {
    return null;
  }

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setSubmitted(true);

    try {
      updateRatingMutation.mutate({
        productId,
        rating,
      });
      toast.success("Thanks for rating!");
    } catch (err) {
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-2 font-semibold text-gray-900">Rate this product</h3>

      {!submitted ? (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="text-3xl transition-all hover:scale-110 focus:outline-none"
            >
              <span
                className={
                  (hoveredStar !== null && star <= hoveredStar) ||
                  (hoveredStar === null &&
                    selectedRating !== null &&
                    star <= selectedRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            </button>
          ))}
          {(hoveredStar || selectedRating) && (
            <span className="ml-2 text-sm text-gray-600">
              {hoveredStar || selectedRating} star
              {(hoveredStar || selectedRating) !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      ) : (
        <div className="font-medium text-green-600">
          ✓ Thanks for rating! You gave {selectedRating} star
          {selectedRating !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
