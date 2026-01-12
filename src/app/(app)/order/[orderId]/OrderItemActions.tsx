"use client";

import { useMemo, useState } from "react";
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
  orderStatus: "processing" | "in_transit" | "delivered" | "cancelled";
  orderCreatedAtMs: number;
  itemId: string;
  itemSubtotal: string;
  refundStatus: "pending" | "approved" | "rejected" | "refunded" | null;
};

export default function OrderItemActions({
  orderId,
  orderStatus,
  orderCreatedAtMs,
  itemId,
  refundStatus,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const canRefund = useMemo(() => {
    if (orderStatus !== "delivered") return false;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - orderCreatedAtMs <= THIRTY_DAYS_MS;
  }, [orderStatus, orderCreatedAtMs]);

  const refundRequest = api.order.refundRequest.useMutation({
    onSuccess: () => router.refresh(),
  });

  async function submitRefund() {
    const trimmed = reason.trim();

    if (trimmed.length < 3) {
      toast.error("Please enter a valid reason.");
      return; // keep dialog open
    }

    try {
      await refundRequest.mutateAsync({
        orderId,
        orderItemId: itemId,
        reason: trimmed,
      });

      toast.success("Refund request submitted.");
      setOpen(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to request refund.";
      toast.error(message);
    }
  }

  // Not eligible for refund at all
  if (!canRefund) return null;

  // Any existing refund state -> show label only, no button
  if (refundStatus) {
    const label =
      refundStatus === "pending"
        ? "Refund: Pending"
        : refundStatus === "approved"
          ? "Refund: Approved"
          : refundStatus === "rejected"
            ? "Refund: Rejected"
            : "Refund: Refunded";

    return (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    );
  }

  // No refund yet -> allow request
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={refundRequest.isPending}
        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {refundRequest.isPending ? "Requesting..." : "Request refund"}
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request a refund</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a short reason for your refund request.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-2 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Refund reason
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={refundRequest.isPending}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Tip: keep it clear, like “Wrong size” or “Damaged item”.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={refundRequest.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // don’t auto-close
                void submitRefund();
              }}
              disabled={refundRequest.isPending}
            >
              {refundRequest.isPending ? "Submitting..." : "Submit request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
