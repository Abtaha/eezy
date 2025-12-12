"use client";

import ProductCard from "@/components/product-card";
import ProductRating from "@/components/product-rating";
import CommentSection from "@/components/comment-section";
import { use, useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { notFound } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { data: session } = authClient.useSession();
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

  const {
    data: relatedProducts,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
    error: relatedError,
  } = api.product.getRelated.useQuery(
    {
      id: productId ?? "",
      limit: 3,
      category: product?.category ?? "",
    },
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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="text-yellow-400">
                      {index < product.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.rating} stars)
                </span>
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

              <section className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">Specifications</h2>

                <dl className="divide-y divide-gray-200">
                  {/* Model */}
                  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Model</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.model}
                    </dd>
                  </div>

                  {/* Serial Number */}
                  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Serial Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.serialNumber}
                    </dd>
                  </div>

                  {/* Warranty */}
                  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Warranty
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.warrantyStatus
                        ? "Under Warranty"
                        : "No Warranty"}
                    </dd>
                  </div>

                  {/* Distributor */}
                  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Distributor Information
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {product.distributor}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Stock Info */}
              <div className="my-6">
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
        <ProductRating productId={productId} isLoggedIn={!!session} />

        {/* Comments Section */}
        <CommentSection productId={productId} />

        {/* Related Products */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Related Products
          </h2>

          {isRelatedLoading ? (
            <div className="flex w-full items-center justify-center py-6">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : isRelatedError ? (
            <div className="flex items-center justify-center py-6">
              Product not found or failed to load.
            </div>
          ) : relatedProducts?.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-gray-500">
              No related products found.
            </div>
          ) : (
            relatedProducts && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    imageFront={product.frontImage}
                    imageBack={product.backImage}
                    name={product.name}
                    category={product.category}
                    price={parseFloat(product.price)}
                    rating={4}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
