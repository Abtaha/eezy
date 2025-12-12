"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type OrderStatus = "processing" | "in_transit" | "delivered";

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

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "C1",
    totalAmount: 499.9,
    status: "processing",
    createdAt: "2025-12-06T10:00:00+03:00",
  },
  {
    id: "ORD-002",
    userId: "C2",
    totalAmount: 899,
    status: "in_transit",
    createdAt: "2025-12-05T15:30:00+03:00",
  },
  {
    id: "ORD-003",
    userId: "C3",
    totalAmount: 199,
    status: "delivered",
    createdAt: "2025-12-04T09:15:00+03:00",
  },
];

type SortKey = "createdAt_desc" | "createdAt_asc" | "status";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");

  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    switch (sortKey) {
      case "createdAt_asc":
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      case "status":
        return copy.sort((a, b) => a.status.localeCompare(b.status));
      case "createdAt_desc":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }
  }, [orders, sortKey]);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    // later call Orders router mutation here
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by</span>
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
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2 font-mono text-xs">{order.id}</td>
                <td className="px-4 py-2">{order.userId}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {new Date(formatDate(order.createdAt)).toLocaleString()}
                </td>
                <td className="px-4 py-2">$ {order.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <Select
                    value={order.status}
                    onValueChange={(value: OrderStatus) =>
                      updateStatus(order.id, value)
                    }
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_transit">In transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </td>

              </tr>
            ))}

            {sortedOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
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
