"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/product-card";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { api } from "@/trpc/react";

type Product = {
  id: string;
  imageFront: string;
  imageBack: string;
  name: string;
  category: string;
  price: number;
  rating: number;
};

type SortOption = "price-asc" | "price-desc" | "rating-desc";

export default function StorePage() {
  const { data: dbProducts, isLoading } = api.product.getAll.useQuery();
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSidebarFilters, setShowSidebarFilters] = useState(true);

  const minPrice = 0;
  const maxPrice = 500;

  const products: Product[] = useMemo(() => {
    if (!dbProducts) return [];

    return dbProducts.map((product) => ({
      id: product.id,
      imageFront: product.frontImage,
      imageBack: product.backImage,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      rating: 5,
    }));
  }, [dbProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(
      (p) =>
        p.price >= (priceRange[0] ?? 0) &&
        p.price <= (priceRange[1] ?? maxPrice),
    );

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating-desc":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [products, priceRange, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-border border-b py-6">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Our Collection
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters - Desktop */}
          {showSidebarFilters && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-8 space-y-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
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
                  <Select
                    value={sortBy}
                    onValueChange={(val) => setSortBy(val as SortOption)}
                  >
                    <SelectTrigger className="border-border w-full">
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low-High</SelectItem>
                      <SelectItem value="price-desc">
                        Price: High-Low
                      </SelectItem>
                      <SelectItem value="rating-desc">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="border-border space-y-3 border-t pt-6">
                  <Label className="text-sm font-semibold">Price Range</Label>
                  <div className="text-muted-foreground mb-3 flex items-center justify-between text-sm">
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
                      setPriceRange([0, 180]);
                      setSortBy("price-asc");
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
            <div className="mb-6 lg:hidden">
              <Button
                variant="outline"
                className="flex w-full items-center justify-between bg-transparent"
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
                <div className="border-border mt-4 space-y-6 rounded-lg border p-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Sort by</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(val) => setSortBy(val as SortOption)}
                    >
                      <SelectTrigger className="border-border w-full">
                        <SelectValue placeholder="Select sort option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="rating-desc">
                          Rating: High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-border space-y-3 border-t pt-6">
                    <Label className="text-sm font-semibold">Price Range</Label>
                    <div className="text-muted-foreground mb-3 flex items-center justify-between text-sm">
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
              <p className="text-muted-foreground text-sm">
                Showing {filteredAndSortedProducts.length} products
              </p>

              {!showSidebarFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden bg-transparent lg:inline-flex"
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
                    setPriceRange([minPrice, maxPrice]);
                    setSortBy("price-asc");
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
                    id={product.id}
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
  );
}
