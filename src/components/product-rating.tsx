"use client"

import { useState } from 'react';

interface ProductRatingProps {
  productId: string;
  isLoggedIn: boolean; // Will be connected to auth later
  onRatingSubmit?: (rating: number) => void; // For future backend integration
}

export default function ProductRating({ productId, isLoggedIn, onRatingSubmit }: ProductRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Don't show if user not logged in
  if (!isLoggedIn) {
    return null;
  }

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setSubmitted(true);
    
    // Call the callback if provided (for future backend integration)
    if (onRatingSubmit) {
      onRatingSubmit(rating);
    }

    // Reset after 2 seconds to allow re-rating (for demo purposes)
    setTimeout(() => {
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-gray-900 mb-2">Rate this product</h3>
      
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
                  (hoveredStar === null && selectedRating !== null && star <= selectedRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }
              >
                ★
              </span>
            </button>
          ))}
          {(hoveredStar || selectedRating) && (
            <span className="ml-2 text-sm text-gray-600">
              {hoveredStar || selectedRating} star{(hoveredStar || selectedRating) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      ) : (
        <div className="text-green-600 font-medium">
          ✓ Thanks for rating! You gave {selectedRating} star{selectedRating !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}