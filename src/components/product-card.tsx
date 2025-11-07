"use client"

import React from 'react';
import Image from 'next/image';

interface ProductCardProps {
  imageFront: string;
  imageBack: string;
  name: string;
  category: string;
  price: number;
  rating: number;
}

export default function ProductCard({ imageFront, imageBack, name, category, price, rating }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-sm hover:shadow-xl transition-shadow duration-300">
      {/* hover effect */}
      <div 
        className="relative w-full h-64 mb-4 overflow-hidden rounded-md"
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
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {name}
      </h3>
      
      <p className="text-sm text-gray-600 mb-2">
        {category}
      </p>

      <p className="text-xl font-bold text-gray-900 mb-2">
        ${price.toFixed(2)}
      </p>

      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <span key={index} className="text-yellow-400">
            {index < rating ? '★' : '☆'}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({rating}/5)
        </span>
      </div>
    </div>
  );
}