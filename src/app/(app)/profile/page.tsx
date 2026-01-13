"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Receipt,
  MapPin,
  User,
  Mail,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  // 1. Fetch Data
  const {
    data: profile,
    isLoading,
    refetch,
  } = api.profile.getMyProfile.useQuery();

  // 2. Mutation (Only for Address)
  const updateAddress = api.profile.updateAddress.useMutation({
    onSuccess: async () => {
      toast.success("Address updated successfully");
      await refetch(); // Refresh data to ensure sync
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // 3. Local State
  const [isEditing, setIsEditing] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  // Sync state when profile data loads
  useEffect(() => {
    if (profile) {
      setAddressInput(profile.homeAddress ?? "");
    }
  }, [profile]);

  // Handlers
  const handleCancel = () => {
    // Reset to original data
    if (profile) {
      setAddressInput(profile.homeAddress ?? "");
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    // Basic validation
    if (!addressInput.trim()) {
      toast.error("Address cannot be empty");
      return;
    }

    updateAddress.mutate({
      address: addressInput,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 p-4 md:p-12">
      <header className="flex items-center justify-between border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage your shipping information
          </p>
        </div>

        {/* Toggle Edit Button */}
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Address
          </Button>
        )}
      </header>

      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="grid gap-6">
          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              User ID
            </Label>
            <Input
              value={profile.id}
              disabled
              className="cursor-not-allowed border-gray-200 bg-gray-100/50 text-gray-500"
            />
          </div>

          {/* Name Field (READ ONLY) */}
          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              value={profile.name}
              disabled
              className="cursor-not-allowed border-gray-200 bg-gray-100/50 text-gray-500"
            />
          </div>

          {/* Email Field (READ ONLY) */}
          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              value={profile.email}
              disabled
              className="cursor-not-allowed border-gray-200 bg-gray-100/50 text-gray-500"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-gray-600">
              <Receipt className="h-4 w-4" />
              Tax ID
            </Label>
            <Input
              value={profile.taxID}
              disabled
              className="cursor-not-allowed border-gray-200 bg-gray-100/50 text-gray-500"
            />
          </div>

          {/* Home Address Field (EDITABLE) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                Home Address
              </Label>
              {isEditing && (
                <span className="animate-pulse text-xs font-medium text-blue-600">
                  Editing...
                </span>
              )}
            </div>

            <Input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your home address"
              className={`font-medium transition-all duration-200 ${
                !isEditing
                  ? "border-gray-200 bg-gray-50/50 text-gray-900"
                  : "border-blue-500 bg-white text-gray-900 ring-4 ring-blue-500/10"
              }`}
            />
          </div>

          {/* Action Buttons (Only visible in Edit Mode) */}
          {isEditing && (
            <div className="animate-in fade-in slide-in-from-top-2 flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={updateAddress.isPending}
                className="gap-2 text-gray-500 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateAddress.isPending}
                className="min-w-[100px] gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {updateAddress.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
