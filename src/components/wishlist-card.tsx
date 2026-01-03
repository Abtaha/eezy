"use client";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import { X, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function WishlistCard({
  id,
  imageFront,
  name,
  category,
  price,
  rating,
}: {
  id: string;
  imageFront: string;
  imageBack: string;
  name: string;
  category: string;
  price: number;
  rating: number;
}) {
  const router = useRouter();
  const removeMutation = api.wishlist.removeItem.useMutation();
  const { addItem } = useCart();

  const removeFromWishlist = async (productId: string) => {
    try {
      await removeMutation.mutateAsync({ productId });
      router.refresh();
      toast.success("Removed from wishlist");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to remove from wishlist");
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      addItem(
        {
          id: productId,
          name,
          price,
          quantity: 1,
        },
        true,
      );

      await removeMutation.mutateAsync({ productId });

      toast.success("Moved to cart");
      router.refresh();
    } catch {
      toast.error("Failed to move item to cart");
    }
  };

  const isLoading = removeMutation.isPending;

  return (
    <Card className="relative w-full">
      {/* Remove */}
      <button
        onClick={() => removeFromWishlist(id)}
        disabled={isLoading}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 rounded-full p-1 transition disabled:opacity-50"
        aria-label="Remove from wishlist"
      >
        <X className="h-4 w-4" />
      </button>

      <CardContent className="flex gap-4 p-4">
        {/* Image */}
        <Link
          href={`/product/${id}`}
          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border"
        >
          <Image src={imageFront} alt={name} fill className="object-cover" />
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-1">
            <Link
              href={`/product/${id}`}
              className="text-base font-semibold hover:underline"
            >
              {name}
            </Link>

            <p className="text-muted-foreground text-sm">{category}</p>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">${price.toFixed(2)}</span>
              <Badge variant="secondary">{rating}/5 ★</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => moveToCart(id)}
              disabled={isLoading}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Move to cart
            </Button>

            <Button size="sm" variant="outline" asChild>
              <Link href={`/product/${id}`}>View product</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
