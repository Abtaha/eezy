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
  rating: number;
}

export default function ProductCard({
  id,
  imageFront,
  imageBack,
  name,
  category,
  price,
  rating,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

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

        <p className="mb-2 text-xl font-bold text-gray-900">
          ${price.toFixed(2)}
        </p>

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

