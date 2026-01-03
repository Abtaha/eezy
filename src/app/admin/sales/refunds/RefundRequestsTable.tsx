"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
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

type Row = {
  refundId: string;
  refundStatus: "pending" | "approved" | "rejected" | "refunded";
  refundAmount: string;
  reason: string;
  requestDate: Date;

  orderItemId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;

  orderId: string;
  orderStatus: "processing" | "in_transit" | "delivered" | "cancelled";
  orderCreatedAt: Date;

  productId: string;
  productName: string;
  productModel: string;
  productCategory: string;
  frontImage: string | null;

  userId: string;
  userName: string;
  userEmail: string;
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function money(value: string) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}

export default function RefundRequestsTable({
  initialRows,
}: {
  initialRows: Row[];
}) {
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRefundId, setPendingRefundId] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<
    "approved" | "rejected" | null
  >(null);

  const refundDecision = api.order.refundDecision.useMutation({
    onSuccess: () => router.refresh(),
  });

  const dialogCopy = useMemo(() => {
    if (!pendingDecision) {
      return {
        title: "Confirm action",
        description: "",
        actionLabel: "Confirm",
      };
    }

    if (pendingDecision === "approved") {
      return {
        title: "Accept this refund request?",
        description: "An email will be sent to the user.",
        actionLabel: "Accept",
      };
    }

    return {
      title: "Deny this refund request?",
      description: "An email will be sent to the user.",
      actionLabel: "Deny",
    };
  }, [pendingDecision]);

  function openDecision(refundId: string, decision: "approved" | "rejected") {
    setPendingRefundId(refundId);
    setPendingDecision(decision);
    setDialogOpen(true);
  }

  async function confirmDecision() {
    if (!pendingRefundId || !pendingDecision) return;

    try {
      await refundDecision.mutateAsync({
        refundId: pendingRefundId,
        decision: pendingDecision,
      });

      toast.success(
        pendingDecision === "approved"
          ? "Refund request accepted."
          : "Refund request denied.",
      );

      setDialogOpen(false);
      setPendingRefundId(null);
      setPendingDecision(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Action failed.";
      toast.error(message);
    }
  }

  if (!initialRows || initialRows.length === 0) {
    return (
      <section className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          No pending refund requests 🎉
        </p>
      </section>
    );
  }

  const busy = refundDecision.isPending;

  return (
    <>
      <section className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Item</th>
              <th className="px-4 py-2 text-left font-medium">User</th>
              <th className="px-4 py-2 text-left font-medium">Order</th>
              <th className="px-4 py-2 text-left font-medium">Requested</th>
              <th className="px-4 py-2 text-right font-medium">Amount</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>

          <tbody>
            {initialRows.map((r) => (
              <tr key={r.refundId} className="border-t align-middle">
                {/* Item */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.frontImage ? (
                      <Image
                        src={r.frontImage}
                        alt={r.productName}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-md border bg-muted/40" />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{r.productName}</p>
                        <Badge>{r.productCategory}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Model: {r.productModel} • Qty: {r.quantity} • Unit:{" "}
                        {money(r.unitPrice)}
                      </p>

                      {/* Reason (now inline, no extra row) */}
                      <p className="mt-2 text-xs font-medium text-muted-foreground">
                        Refund reason
                      </p>
                      <p className="mt-1 text-sm break-words">{r.reason}</p>
                    </div>
                  </div>
                </td>

                {/* User */}
                <td className="px-4 py-3">
                  <p className="font-medium">{r.userName}</p>
                  <p className="text-muted-foreground text-xs">{r.userEmail}</p>
                </td>

                {/* Order */}
                <td className="px-4 py-3">
                  <p className="font-medium">#{r.orderId}</p>
                  <p className="text-muted-foreground text-xs">
                    Status: {r.orderStatus} • {formatDate(r.orderCreatedAt)}
                  </p>
                </td>

                {/* Requested */}
                <td className="px-4 py-3">
                  <Badge>{r.refundStatus}</Badge>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {formatDate(r.requestDate)}
                  </p>
                </td>

                {/* Amount */}
                <td className="px-4 py-3 text-right font-medium">
                  {money(r.refundAmount)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                      onClick={() => openDecision(r.refundId, "rejected")}
                    >
                      Deny
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                      onClick={() => openDecision(r.refundId, "approved")}
                    >
                      Accept
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) {
            setPendingRefundId(null);
            setPendingDecision(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogCopy.description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault(); // don’t auto-close
                void confirmDecision();
              }}
            >
              {busy ? "Working..." : dialogCopy.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}



