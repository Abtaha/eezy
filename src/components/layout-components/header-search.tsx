"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/trpc/react";

type ProductSearchResult = {
  id: string;
  name: string;
  model: string;
  price: string;
  frontImage: string | null;
};

type SearchResultItemProps = {
  product: ProductSearchResult;
  onSelect: () => void;
};

const SearchResultItem = ({ product, onSelect }: SearchResultItemProps) => {
  const router = useRouter();

  const handleClick = async () => {
    router.push(`/product/${product.id}`);
    onSelect();
  };

  const imageSrc =
    product.frontImage && product.frontImage !== ""
      ? product.frontImage
      : "/placeholder-image.png";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-blue-50"
    >
      {/* Thumbnail */}
      <div className="relative h-17 w-17 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Text info */}
      <div className="flex flex-col gap-1">
        <span className="font-medium text-gray-900 text-sm">{product.name}</span>
        <span className="text-xs text-gray-600 mt-1">Model: {product.model}</span>
        <span className="text-xs text-gray-700 mt-1">${product.price}</span>
      </div>
    </button>
  );
};

export const HeaderSearch = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: searchResults = [], isLoading } = api.product.search.useQuery(
    { querystring: query },
    {
      enabled: query.length > 1,
    },
  );

  // allow dropdown even when 0 results
  const showDropdown = searchOpen && query.length > 1;

  return (
    <div className="group relative flex items-center">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`absolute right-8 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          searchOpen ? "visible w-64 opacity-100" : "invisible w-0 opacity-0"
        }`}
      />

      {showDropdown && (
        <div className="absolute right-0 top-9 w-[440px] max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Searching...
            </div>
          )}

          {!isLoading && searchResults.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No products found.
            </div>
          )}

          {!isLoading &&
            searchResults.map((product) => (
              <SearchResultItem
                key={product.id}
                product={product as ProductSearchResult}
                onSelect={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
              />
            ))}
        </div>
      )}

      <Search
        className="h-6 w-6 cursor-pointer hover:text-blue-600"
        onClick={() => setSearchOpen((prev) => !prev)}
      />
    </div>
  );
};
