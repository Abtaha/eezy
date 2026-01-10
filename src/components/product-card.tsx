"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  imageFront: string;
  imageBack: string;
  name: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
}

export default function ProductCard({
  id,
  imageFront,
  imageBack,
  name,
  category,
  price,
  discountPercentage,
  rating,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const finalPrice =
    discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  return (
    <Link href={`/product/${id}`}>
      <div className="max-w-sm cursor-pointer rounded-lg bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-xl">
        {/* hover effect */}
        <div
          className="relative mb-4 h-64 w-full overflow-hidden rounded-md"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={isHovered ? imageBack : imageFront}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-800">{name}</h3>

        <p className="mb-2 text-sm text-gray-600">{category}</p>

        <div className="mb-6 flex flex-col gap-1">
          {discountPercentage > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 line-through">
                ${price.toFixed(2)}
              </span>

              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tight text-gray-900">
              ${finalPrice.toFixed(2)}
            </span>

            <span className="pb-1 text-sm text-gray-500">USD</span>
          </div>
        </div>

        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="text-yellow-400">
              {index < rating ? "★" : "☆"}
            </span>
          ))}
          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
        </div>
      </div>
    </Link>
  );
}
