"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";


type ProductRow = {
  id: string;
  name: string;
  model: string;
  frontImage: string;
  price: string; 
  quantityInStock: number;
};

export default function ManageProductsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});

  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);


  const { data: fetchedProducts, isLoading } =
    api.product.listForStockAdmin.useQuery(undefined, {
      enabled: !!session,
    });

  const updateStockMutation = api.product.updateStock.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const deleteMutation = api.product.deleteAdmin.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });


  const confirmRemove = () => {
    if (!removeTarget) return;

    const { id, name } = removeTarget;

    const prev = products;
    setProducts((p) => p.filter((x) => x.id !== id));

    deleteMutation.mutate(
      { productId: id },
      {
        onSuccess: () => {
          toast.success(`Removed "${name}".`);
          setRemoveTarget(null);
          router.refresh();
        },
        onError: (err) => {
          setProducts(prev);
          toast.error(err.message || "Failed to remove product.");
          setRemoveTarget(null);
        },
      },
    );
  };

  const handleRemove = (id: string, name: string) => {
    setRemoveTarget({ id, name });
  };


  useEffect(() => {
    if (fetchedProducts) {
      setProducts(fetchedProducts);

      const initDraft: Record<string, string> = {};
      for (const p of fetchedProducts) {
        initDraft[p.id] = String(p.quantityInStock);
      }
      setStockDraft(initDraft);
    }
  }, [fetchedProducts]);

  const byId = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const applyOptimisticStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantityInStock: newStock } : p,
      ),
    );
    setStockDraft((prev) => ({ ...prev, [productId]: String(newStock) }));
  };

  const commitStock = (productId: string, newStock: number) => {
    const current = byId.get(productId)?.quantityInStock ?? 0;

    applyOptimisticStock(productId, newStock);

    try {
      updateStockMutation.mutate({ productId, quantityInStock: newStock });
      toast.success("Stock updated.");
    } catch (err) {
      // rollback if something truly throws here
      applyOptimisticStock(productId, current);

      if (err instanceof TRPCClientError) toast.error(err.message);
      else toast.error("Failed to update stock.");
    }
  };

  const handleDelta = (productId: string, delta: number) => {
    const current = byId.get(productId)?.quantityInStock ?? 0;
    const next = Math.max(0, current + delta);
    commitStock(productId, next);
  };

  const handleSetStock = (productId: string) => {
    const raw = stockDraft[productId] ?? "0";
    const parsed = Number.parseInt(raw, 10);

    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
      toast.error("Stock must be a number.");
      return;
    }
    if (parsed < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    commitStock(productId, parsed);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Manage Products</h2>
          <p className="text-muted-foreground text-sm">
            Update product stock amounts.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/product/add-product">Add Product</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products found.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
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
                </div>

                <div className="text-right">
                  <div>
                    <p className="text-sm font-medium">
                      Stock: {p.quantityInStock}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Price: {p.price}
                    </p>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleRemove(p.id, p.name)}>
                    Remove
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelta(p.id, -1)}
                    >
                      -1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelta(p.id, +1)}
                    >
                      +1
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      className="w-28"
                      value={stockDraft[p.id] ?? ""}
                      onChange={(e) =>
                        setStockDraft((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      inputMode="numeric"
                      placeholder="Stock"
                    />
                    <Button size="sm" onClick={() => handleSetStock(p.id)}>
                      Set
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove product?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `This will permanently remove "${removeTarget.name}".`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
                Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
