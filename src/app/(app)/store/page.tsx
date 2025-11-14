"use client"

import { useMemo, useState } from "react"
import ProductCard from "@/components/product-card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, X } from "lucide-react"

type Product = {
  id: number
  imageFront: string
  imageBack: string
  name: string
  category: string
  price: number
  rating: number
}

const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Basic White T-Shirt",
    category: "T-Shirts",
    price: 40,
    rating: 4,
    imageFront: "/store-images/white-tee-front.jpg",
    imageBack: "/store-images/white-tee-back.jpg",
  },
  {
    id: 2,
    name: "Blue Denim Jacket",
    category: "Jackets",
    price: 150,
    rating: 5,
    imageFront: "/store-images/denim-jacket-front.jpg",
    imageBack: "/store-images/denim-jacket-back.jpg",
  },
  {
    id: 3,
    name: "Black Oversized Hoodie",
    category: "Hoodies",
    price: 100,
    rating: 4,
    imageFront: "/store-images/hoodie-black-front.jpg",
    imageBack: "/store-images/hoodie-black-back.jpg",
  },
  {
    id: 4,
    name: "Checked Casual Shirt",
    category: "Shirts",
    price: 80,
    rating: 3,
    imageFront: "/store-images/checked-shirt-front.jpg",
    imageBack: "/store-images/checked-shirt-back.jpg",
  },
  {
    id: 5,
    name: "Beige Chino Pants",
    category: "Pants",
    price: 120,
    rating: 5,
    imageFront: "/store-images/chinos-front.jpg",
    imageBack: "/store-images/chinos-back.jpg",
  },
  {
    id: 6,
    name: "Red Crew Neck Sweater",
    category: "Sweaters",
    price: 90,
    rating: 3,
    imageFront: "/store-images/sweater-red-front.jpg",
    imageBack: "/store-images/sweater-red-back.jpg",
  },
  {
    id: 7,
    name: "Navy Blue Shorts",
    category: "Shorts",
    price: 85,
    rating: 1,
    imageFront: "/store-images/shorts-navy-front.jpg",
    imageBack: "/store-images/shorts-navy-back.jpg",
  },
  {
    id: 8,
    name: "Gray Polo Shirt",
    category: "Shirts",
    price: 65,
    rating: 4,
    imageFront: "/store-images/polo-gray-front.jpg",
    imageBack: "/store-images/polo-gray-back.jpg",
  },
  {
    id: 9,
    name: "Black Cargo Pants",
    category: "Pants",
    price: 105,
    rating: 2,
    imageFront: "/store-images/cargo-black-front.jpg",
    imageBack: "/store-images/cargo-black-back.jpg",
  },
]

type SortOption = "price-asc" | "price-desc" | "rating-desc"

export default function StorePage() {
  const [priceRange, setPriceRange] = useState<number[]>([0, 180])
  const [sortBy, setSortBy] = useState<SortOption>("price-asc")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showSidebarFilters, setShowSidebarFilters] = useState(true)

  const minPrice = 0
  const maxPrice = 180

  const filteredAndSortedProducts = useMemo(() => {
    let result = DUMMY_PRODUCTS.filter(
      (p) => p.price >= (priceRange[0] ?? 0) && p.price <= (priceRange[1] ?? 180),
    )

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "rating-desc":
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return result
  }, [priceRange, sortBy])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border py-6">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Our Collection</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          {showSidebarFilters && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowSidebarFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Sort by</Label>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                    <SelectTrigger className="w-full border-border">
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low-High</SelectItem>
                      <SelectItem value="price-desc">Price: High-Low</SelectItem>
                      <SelectItem value="rating-desc">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3 border-t border-border pt-6">
                  <Label className="text-sm font-semibold">Price Range</Label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="font-medium">${priceRange[0]}</span>
                    <span className="font-medium">${priceRange[1]}</span>
                  </div>
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />
                </div>

                {/* Reset Filters */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setPriceRange([0, 180])
                      setSortBy("price-asc")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            {/* Mobile(Smaller Window) Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-between bg-transparent"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <span>Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showMobileFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {showMobileFilters && (
                <div className="mt-4 space-y-6 p-4 border border-border rounded-lg">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Sort by</Label>
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                      <SelectTrigger className="w-full border-border">
                        <SelectValue placeholder="Select sort option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 border-t border-border pt-6">
                    <Label className="text-sm font-semibold">Price Range</Label>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="font-medium">${priceRange[0]}</span>
                      <span className="font-medium">${priceRange[1]}</span>
                    </div>
                    <Slider
                      min={minPrice}
                      max={maxPrice}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>

                  {/* Close Filters button (for mobile) */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Close Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Products header + Show Filters (only for desktop) */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedProducts.length} products
              </p>

              {!showSidebarFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:inline-flex bg-transparent"
                  onClick={() => setShowSidebarFilters(true)}
                >
                  Show Filters
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-4">
                  No products found in this price range.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPriceRange([0, 180])
                    setSortBy("price-asc")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    imageFront={product.imageFront}
                    imageBack={product.imageBack}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    rating={product.rating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
