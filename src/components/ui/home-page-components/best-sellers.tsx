"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

const bestsellers = [
  {
    id: 1,
    name: "Basic White T-Shirt",
    category: "Men",
    image: "/bestseller-white-tshirt.jpg",
    href: "/category/men/white-tshirt",
  },
  {
    id: 2,
    name: "Classic Blue Jeans",
    category: "Women",
    image: "/bestseller-blue-jeans.jpg",
    href: "/category/women/blue-jeans",
  },
  {
    id: 3,
    name: "Kids Jacket",
    category: "Kids",
    image: "/bestseller-kids-jacket.jpg",
    href: "/category/kids/jacket",
  },
  {
    id: 4,
    name: "Gray Hoodie",
    category: "Men",
    image: "/bestseller-gray-hoodie.jpg",
    href: "/category/men/gray-hoodie",
  },
  {
    id: 5,
    name: "Black T-Shirt",
    category: "Women",
    image: "/bestseller-black-tshirt.jpg",
    href: "/category/women/black-tshirt",
  },
  {
    id: 6,
    name: "Khaki Pants",
    category: "Men",
    image: "/bestseller-khaki-pants.jpg",
    href: "/category/men/khaki-pants",
  },
  {
    id: 7,
    name: "Denim Shorts",
    category: "Kids",
    image: "/bestseller-denim-shorts.jpg",
    href: "/category/men/denim-shorts",
  },
  {
    id: 8,
    name: "Navy Hoodie",
    category: "Women",
    image: "/bestseller-navy-hoodie.jpg",
    href: "/category/women/navy-hoodie",
  },
]

export function Bestsellers() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-opacity hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide md:gap-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {bestsellers.map((product) => (
              <Link
                key={product.id}
                href={product.href}
                className="group relative min-w-[200px] shrink-0 overflow-hidden md:min-w-[250px]"
              >
                <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-opacity hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-900" />
          </button>
        </div>
      </div>
    </section>
  )
}
