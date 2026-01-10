"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProductRow = {
  id: string;
  name: string;
  model: string;
  frontImage: string;
  price: number;
  discount: number; // percentage 0–100
};

export default function ManagePricingPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [discountDraft, setDiscountDraft] = useState<Record<string, string>>(
    {},
  );

  const { data: fetchedProducts, isLoading } =
    api.product.listForPriceAdmin.useQuery(undefined, {
      enabled: !!session,
    });

  const updatePricingMutation = api.product.updatePrice.useMutation({
    onSuccess: () => {
      toast.success("Pricing updated.");
      router.refresh();
    },
  });

  useEffect(() => {
    if (!fetchedProducts) return;

    setProducts(fetchedProducts);

    const priceInit: Record<string, string> = {};
    const discountInit: Record<string, string> = {};

    for (const p of fetchedProducts) {
      priceInit[p.id] = String(p.price);
      discountInit[p.id] = String(p.discount ?? 0);
    }

    setPriceDraft(priceInit);
    setDiscountDraft(discountInit);
  }, [fetchedProducts]);

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const applyOptimisticPricing = (
    productId: string,
    price: number,
    discount: number,
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price, discount } : p)),
    );

    setPriceDraft((p) => ({ ...p, [productId]: String(price) }));
    setDiscountDraft((p) => ({ ...p, [productId]: String(discount) }));
  };

  const commitPricing = (
    productId: string,
    price: number,
    discount: number,
  ) => {
    const current = byId.get(productId);
    if (!current) return;

    applyOptimisticPricing(productId, price, discount);

    updatePricingMutation.mutate(
      { productId, price, discount },
      {
        onError: (err) => {
          applyOptimisticPricing(productId, current.price, current.discount);
          toast.error(err.message || "Failed to update pricing.");
        },
      },
    );
  };

  const handleSetPricing = (productId: string) => {
    const price = Number(priceDraft[productId]);
    const discount = Number(discountDraft[productId]);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      toast.error("Discount must be between 0 and 100.");
      return;
    }

    commitPricing(productId, price, discount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Manage Pricing</h2>
          <p className="text-muted-foreground text-sm">
            Update product price and discount.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products found.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Image
                  src={p.frontImage}
                  alt={p.name}
                  width={48}
                  height={48}
                  className="rounded-md border object-cover"
                />

                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Model: {p.model} • ID: {p.id}
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground text-xs">
                      Price
                    </label>
                    <Input
                      className="w-32"
                      value={priceDraft[p.id] ?? ""}
                      onChange={(e) =>
                        setPriceDraft((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      inputMode="decimal"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground text-xs">
                      Discount %
                    </label>
                    <Input
                      className="w-32"
                      value={discountDraft[p.id] ?? ""}
                      onChange={(e) =>
                        setDiscountDraft((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      inputMode="numeric"
                    />
                  </div>

                  <Button size="sm" onClick={() => handleSetPricing(p.id)}>
                    Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
