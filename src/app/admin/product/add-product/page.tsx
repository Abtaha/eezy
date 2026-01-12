"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useUploadThing } from "@/lib/uploadthing";

type UploadResponse = {
  url: string;
};

function useImageUpload() {
  const { startUpload, isUploading } = useUploadThing("productImageUploader", {
    onUploadError: (error) => {
      throw new Error(error.message);
    },
  });

  const uploadImage = async (file: File): Promise<UploadResponse> => {
    const res = await startUpload([file]);

    if (!res || !res[0]?.ufsUrl) {
      throw new Error("Upload failed");
    }

    return { url: res[0].ufsUrl };
  };

  return {
    uploadImage,
    isUploading,
  };
}

export default function AddProductPage() {
  const router = useRouter();
  const createMutation = api.product.createAdmin.useMutation({
    onSuccess: () => {
      toast.success("Product added.");
      router.push("/admin/product/manage-products");
      router.refresh();
    },
  });

  const { uploadImage } = useImageUpload();

  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [distributor, setDistributor] = useState("");

  const [quantityInStock, setQuantityInStock] = useState("0");
  const [price, setPrice] = useState("");
  const [warrantyStatus, setWarrantyStatus] = useState(false);
  const [cost, setCost] = useState("");

  const [frontImage, setFrontImage] = useState("");
  const [backImage, setBackImage] = useState("");

  const uploadFile = async (file: File) => {
    const { url } = await uploadImage(file);
    return url;
  };

  const handleSubmit = () => {
    const q = Number.parseInt(quantityInStock, 10);
    const p = Number.parseFloat(price);

    if (!name || !model || !category) {
      toast.error("Name, model, and category are required.");
      return;
    }
    if (!frontImage || !backImage) {
      toast.error("Front and back image are required.");
      return;
    }
    if (!Number.isFinite(q) || q < 0) {
      toast.error("Quantity must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(p) || p < 0) {
      toast.error("Price must be a valid number.");
      return;
    }

    try {
      createMutation.mutate({
        name,
        model,
        category,
        description: description || null,
        distributor: distributor || null,
        quantityInStock: q,
        price: p,
        cost: cost !== "" ? Number.parseFloat(cost) : undefined,
        warrantyStatus,
        frontImage,
        backImage,
      });
    } catch (err) {
      if (err instanceof TRPCClientError) toast.error(err.message);
      else toast.error("Failed to add product.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Add Product</h2>
          <p className="text-muted-foreground text-sm">
            Fill all required fields, upload front/back images, then add to
            stock.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader />
        <CardContent className="space-y-5">
          {/* Basic info */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Name *</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Model *</p>
              <Input value={model} onChange={(e) => setModel(e.target.value)} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Category *</p>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Distributor</p>
              <Input
                value={distributor}
                onChange={(e) => setDistributor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Description</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Stock + pricing */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity in Stock *</p>
              <Input
                inputMode="numeric"
                value={quantityInStock}
                onChange={(e) => setQuantityInStock(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Price *</p>
              <Input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Cost</p>
              <Input
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Warranty Status</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={warrantyStatus}
                  onChange={(e) => setWarrantyStatus(e.target.checked)}
                />
                Has warranty
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Front Image *</p>

              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const url = await uploadFile(file);
                    setFrontImage(url);
                    toast.success("Front image uploaded.");
                  } catch (e) {
                    toast.error("Front image upload failed.");
                  }
                }}
              />
              {frontImage && (
                <Image
                  src={frontImage}
                  alt="Front preview"
                  width={240}
                  height={240}
                  className="rounded-md border object-cover"
                />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Back Image *</p>

              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const url = await uploadFile(file);
                    setBackImage(url);
                    toast.success("Back image uploaded.");
                  } catch (e) {
                    toast.error("Back image upload failed.");
                  }
                }}
              />
              {backImage && (
                <Image
                  src={backImage}
                  alt="Back preview"
                  width={240}
                  height={240}
                  className="rounded-md border object-cover"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              Add item to stock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
