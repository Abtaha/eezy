"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductCard from "@/components/product-card";
import { Slider } from "@/components/ui/slider";
import { Loader2, ChevronDown, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

// Types
type Product = {
  id: string;
  imageFront: string;
  imageBack: string;
  name: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
};

type SortOption = "price-asc" | "price-desc" | "rating-desc";

const MIN_PRICE = 0;
const MAX_PRICE = 500;

export default function StorePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // -- Data Fetching --
  const { data: dbProducts, isLoading } = api.product.getAll.useQuery();

  const { data: allCategories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();

  // -- State --
  // Initialize from URL if available, otherwise default
  const initialCategory = searchParams.get("category") ?? "All";

  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");

  // Two states for price: one for the UI slider (instant), one for the actual filter (committed)
  const [priceRange, setPriceRange] = useState<number[]>([
    MIN_PRICE,
    MAX_PRICE,
  ]);
  const [committedPriceRange, setCommittedPriceRange] = useState<number[]>([
    MIN_PRICE,
    MAX_PRICE,
  ]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSidebarFilters, setShowSidebarFilters] = useState(true);

  // -- URL Synchronization --
  // Update URL when category changes so links are shareable
  const updateUrlCategory = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category && category !== "All") {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    updateUrlCategory(val);
  };

  // -- Transformations --
  const products: Product[] = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map((product) => ({
      id: product.id,
      imageFront: product.frontImage,
      imageBack: product.backImage,
      name: product.name,
      category: product.category,
      price:
        typeof product.price === "string"
          ? parseFloat(product.price)
          : Number(product.price),
      rating: product.rating,
      discountPercentage: product.discountPercentage,
    }));
  }, [dbProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    // Filter
    let result = products.filter((p) => {
      const matchesPrice =
        p.price >= (committedPriceRange?.[0] ?? MIN_PRICE) &&
        p.price <= (committedPriceRange?.[1] ?? MAX_PRICE);

      if (categoryFilter === "All" || !categoryFilter) {
        return matchesPrice;
      }

      const matchesCategory = p.category === categoryFilter;
      return matchesPrice && matchesCategory;
    });

    // Sort
    result.sort((a, b) => {
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
  }, [products, committedPriceRange, sortBy, categoryFilter]);

  const handleResetFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setCommittedPriceRange([MIN_PRICE, MAX_PRICE]);
    setSortBy("price-asc");
    handleCategoryChange("All");
  };

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
          <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
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
              <div className="sticky top-24 space-y-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Filter className="h-4 w-4" /> Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowSidebarFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filters Content */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Category</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {allCategories?.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Sort by</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(val) => setSortBy(val as SortOption)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="rating-desc">Top Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-border space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <Label>Price Range</Label>
                      <span className="text-muted-foreground text-sm">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange} // Visual update (smooth)
                      onValueCommit={setCommittedPriceRange} // Filter update (performance)
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="mb-6 lg:hidden">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showMobileFilters ? "rotate-180" : ""}`}
                />
              </Button>

              {showMobileFilters && (
                <div className="border-border mt-4 space-y-6 rounded-lg border bg-gray-50/50 p-4">
                  {/* Reuse the logic for mobile filters here (simplified for brevity) */}
                  <div className="space-y-3">
                    <Label>Category</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {allCategories?.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* ... Add other mobile filters here matching desktop ... */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>

            {/* Grid Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing <strong>{filteredAndSortedProducts.length}</strong>{" "}
                products
              </p>

              {!showSidebarFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden gap-2 lg:inline-flex"
                  onClick={() => setShowSidebarFilters(true)}
                >
                  <Filter className="h-4 w-4" /> Show Filters
                </Button>
              )}
            </div>

            {/* Empty State */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
                <p className="text-muted-foreground mb-4 text-lg">
                  No products found matching your filters.
                </p>
                <Button variant="secondary" onClick={handleResetFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              /* Grid */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
