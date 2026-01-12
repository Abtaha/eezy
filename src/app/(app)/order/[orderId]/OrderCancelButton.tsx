"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

type Props = {
  orderId: string;
  status: "processing" | "in_transit" | "delivered" | "cancelled";
};

export default function OrderCancelButton({ orderId, status }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const cancelOrder = api.order.cancelOrder.useMutation({
    onSuccess: () => router.refresh(),
  });

  if (status !== "processing") return null;

  async function confirmCancel() {
    try {
      setBusy(true);
      await cancelOrder.mutateAsync({ orderId });

      toast.success("Order cancelled.");
      setOpen(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to cancel order.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={busy || cancelOrder.isPending}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {cancelOrder.isPending ? "Cancelling..." : "Cancel order"}
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              If you cancel now, we’ll stop processing the order.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy || cancelOrder.isPending}>
              Keep order
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={busy || cancelOrder.isPending}
              onClick={(e) => {
                e.preventDefault(); // don’t auto-close
                void confirmCancel();
              }}
            >
              {cancelOrder.isPending ? "Cancelling..." : "Yes, cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
