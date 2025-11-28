"use client";

import ProductCard from "@/components/product-card";
import ProductRating from "@/components/product-rating";
import CommentSection from "@/components/comment-section";
import { use, useState } from "react";
import { useCart } from "@/context/cart-context";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { notFound } from "next/navigation";

// Dummy related products
const RELATED_PRODUCTS = [
  {
    imageFront: "https://placehold.co/400x400/dbeafe/3b82f6?text=Blue+Tee",
    imageBack: "https://placehold.co/400x400/bfdbfe/2563eb?text=Blue+Tee+Back",
    name: "Classic Blue T-Shirt",
    category: "T-Shirts",
    price: 24.99,
    rating: 4,
  },
  {
    imageFront: "https://placehold.co/400x400/dcfce7/10b981?text=Green+Jacket",
    imageBack:
      "https://placehold.co/400x400/bbf7d0/059669?text=Green+Jacket+Back",
    name: "Wind Breaker Jacket",
    category: "Jackets",
    price: 89.99,
    rating: 5,
  },
  {
    imageFront:
      "https://placehold.co/400x400/fef3c7/f59e0b?text=Yellow+Sweater",
    imageBack:
      "https://placehold.co/400x400/fde68a/d97706?text=Yellow+Sweater+Back",
    name: "Duckling Yellow Sweater",
    category: "Sweaters",
    price: 39.99,
    rating: 4,
  },
];

// Dummy comments
const DUMMY_COMMENTS = [
  {
    id: "1",
    authorName: "Mew",
    authorInitial: "M",
    avatarColor: "bg-pink-500",
    text: "Absolutely love this hoodie! The fabric is so soft and the pink color is exactly as shown.",
    timestamp: "2 days ago",
  },
  {
    id: "2",
    authorName: "Squirtle",
    authorInitial: "S",
    avatarColor: "bg-blue-500",
    text: "Fits true to size and the kangaroo pocket is surprisingly spacious. Already ordered two more in different colors.",
    timestamp: "5 days ago",
  },
  {
    id: "3",
    authorName: "Bulbasaur",
    authorInitial: "B",
    avatarColor: "bg-green-500",
    text: "Nice hoodie but runs a bit small. I usually wear M but needed L for a comfortable fit.",
    timestamp: "1 week ago",
  },
  {
    id: "4",
    authorName: "Mewtwo",
    authorInitial: "M",
    avatarColor: "bg-purple-500",
    text: "Incredibly cozy. Highly recommend! ⭐⭐⭐⭐⭐",
    timestamp: "2 weeks ago",
  },
];

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const { addItem } = useCart();
  const [currentImage, setCurrentImage] = useState<"front" | "back">("front");

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = api.product.get.useQuery(
    { id: productId ?? "" },
    {
      enabled: !!productId,
      retry: false,
    },
  );

  if (!productId || typeof productId !== "string") {
    notFound();
  }

  if (isError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Product not found or failed to load.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Product Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <div className="grid gap-8 md:grid-cols-2">
            {/* LEFT SIDE: Product Images */}
            <div className="space-y-4">
              {/* Main Image Display */}
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={
                    currentImage === "front"
                      ? product.frontImage
                      : product.backImage
                  }
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Image Thumbnails */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentImage("front")}
                  className={`aspect-square flex-1 overflow-hidden rounded-lg border-2 transition-all ${
                    currentImage === "front"
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={product.frontImage}
                    alt="Front view"
                    className="h-full w-full object-cover"
                  />
                </button>

                <button
                  onClick={() => setCurrentImage("back")}
                  className={`aspect-square flex-1 overflow-hidden rounded-lg border-2 transition-all ${
                    currentImage === "back"
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={product.backImage}
                    alt="Back view"
                    className="h-full w-full object-cover"
                  />
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: Product Details */}
            <div className="flex flex-col">
              {/* Product Name & Category */}
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="mb-4 text-gray-600">{product.category}</p>

              {/* Rating Display */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < 5 ? "text-yellow-400" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({5} stars)</span>
              </div>

              {/* Price */}
              <p className="mb-6 text-4xl font-bold text-gray-900">
                ${parseFloat(product.price).toFixed(2)}
              </p>

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold">Description</h2>
                <p className="leading-relaxed text-gray-700">
                  {product.description}
                </p>
              </div>

              {/* Stock Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Stock:{" "}
                  <span
                    className={`font-semibold ${product.quantityInStock > 5 ? "text-green-600" : "text-orange-600"}`}
                  >
                    {product.quantityInStock} available
                  </span>
                </p>
              </div>

              {/* Add to Cart Button - TODO: Connect to CartContext */}
              <button
                className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
                  product.quantityInStock > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
                disabled={product.quantityInStock === 0}
                onClick={() => {
                  addItem({
                    id: productId,
                    name: product.name,
                    price: parseFloat(product.price),
                    quantity: 1,
                  });
                  console.log("Added to cart");
                }}
              >
                {product.quantityInStock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* Rating Component - Only shown when logged in */}
        <ProductRating
          productId={productId}
          isLoggedIn={true} // TODO: Connect to actual auth later - set to true for testing
        />

        {/* Comments Section */}
        <CommentSection comments={DUMMY_COMMENTS} />

        {/* Related Products */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Related Products
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {RELATED_PRODUCTS.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
