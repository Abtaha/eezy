"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { api } from "@/trpc/react";
import ProductCard from "@/components/product-card";

export function Bestsellers() {
  const { data: dbProducts, isLoading } = api.product.getAll.useQuery();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-opacity hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto md:gap-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dbProducts?.map((product) => (
              <div
                key={product.id}
                className="group relative w-[300px] min-w-[200px] shrink-0 overflow-hidden md:min-w-[250px]"
              >
                <ProductCard
                  key={product.id}
                  id={product.id}
                  imageFront={product.frontImage}
                  imageBack={product.backImage}
                  name={product.name}
                  category={product.category}
                  price={parseFloat(product.price)}
                  rating={product.rating}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-opacity hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-900" />
          </button>
        </div>
      </div>
    </section>
  );
}
