"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";

import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

type OrderStatus = "processing" | "in_transit" | "delivered" | "cancelled";

type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SortKey = "createdAt_desc" | "createdAt_asc" | "status";

export default function OrdersPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");

  const { data: fetchedOrders } = api.order.getAllAdmin.useQuery(undefined, {
    enabled: !!session,
  });

  const updateStatusMutation = api.order.updateStatus.useMutation();

  useEffect(() => {
    if (fetchedOrders) {
      const mappedOrders: Order[] = fetchedOrders.map((order) => ({
        id: order.id,
        userId: order.userId.toString(),
        totalAmount: parseFloat(order.totalAmount),
        status: order.status as OrderStatus,
        createdAt: order.createdAt.toString(),
      }));
      setOrders(mappedOrders);
    }
  }, [fetchedOrders]);

  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    switch (sortKey) {
      case "createdAt_asc":
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "status":
        return copy.sort((a, b) => a.status.localeCompare(b.status));
      case "createdAt_desc":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [orders, sortKey]);

  const updateStatus = (id: string, status: OrderStatus) => {
    try {
      updateStatusMutation.mutate({
        orderId: id,
        status,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );

      toast.success(`Order ${id} updated successfully.`);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      }
    }
  };

  const goToOrder = (orderId: string) => {
    router.push(`/admin/product/orders/${orderId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Sort by</span>
          <Select
            value={sortKey}
            onValueChange={(value: SortKey) => setSortKey(value)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Sort orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest first</SelectItem>
              <SelectItem value="createdAt_asc">Oldest first</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {sortedOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => goToOrder(order.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToOrder(order.id);
                }}
                tabIndex={0}
                className="hover:bg-muted/40 focus:bg-muted/40 cursor-pointer border-t transition-colors outline-none"
              >
                <td className="px-4 py-2 font-mono text-xs">{order.id}</td>
                <td className="px-4 py-2">{order.userId}</td>
                <td className="text-muted-foreground px-4 py-2 text-xs">
                  {new Date(formatDate(order.createdAt)).toLocaleString()}
                </td>
                <td className="px-4 py-2">$ {order.totalAmount.toFixed(2)}</td>

                <td
                  className="px-4 py-2"
                  // IMPORTANT: clicking inside status cell should not navigate
                  onClick={(e) => e.stopPropagation()}
                >
                  <Select
                    value={order.status}
                    onValueChange={(value: OrderStatus) =>
                      updateStatus(order.id, value)
                    }
                  >
                    <SelectTrigger
                      className="h-8 w-32 text-xs"
                      // Prevent trigger click from bubbling to <tr>
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      // Extra safety: clicks inside dropdown shouldn't bubble
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_transit">In transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}

            {sortedOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-4 py-6 text-center text-sm"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
