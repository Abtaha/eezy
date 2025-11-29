"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

type ProductSearchResult = {
  id: string;
  name: string;
  price: string;
};

type SearchResultItemProps = {
  product: ProductSearchResult;
  onSelect: () => void;
};

const SearchResultItem = ({ product, onSelect }: SearchResultItemProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${product.id}`);
    onSelect();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm hover:bg-blue-50"
    >
      <span className="font-medium text-gray-900">{product.name}</span>
      <span className="text-xs text-gray-700">${product.price}</span>
    </button>
  );
};

export const HeaderSearch = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: searchResults = [], isLoading } = api.product.search.useQuery(
    { querystring: query },
    {
      enabled: query.length > 2, // only search when user typed at least 3 chars
    },
  );

  const showDropdown =
    searchOpen && query.length > 2;

  return (
    <div className="group relative flex items-center">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`absolute right-8 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          searchOpen ? "visible w-48 opacity-100" : "invisible w-0 opacity-0"
        }`}
      />

      {/* Dropdown search results */}
      {showDropdown && (
        <div className="absolute right-0 top-9 w-72 rounded-md border border-gray-200 bg-white shadow-lg">
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
