"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

export type OrderStatus = "processing" | "in_transit" | "delivered";

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: string | null;
  paymentMethod?: string | null;
  trackingNumber?: string | null;
};

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// status types - badge style mapper
function statusVariant(status: OrderStatus): BadgeVariant {
  switch (status) {
    case "processing":
      return "secondary";
    case "in_transit":
      return "default";
    case "delivered":
      return "default";
  }
}

export const OrderCard = ({ order }: { order: Order }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Order #{order.id}</CardTitle>

        <Badge variant={statusVariant(order.status)}>
          {order.status.toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Placed on</span>
          <span>{formatDate(order.createdAt.toString())}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">
            {formatCurrency(parseFloat(order.totalAmount))}
          </span>
        </div>

        {order.shippingAddress && (
          <div className="mt-2">
            <p className="text-muted-foreground text-xs">Shipping address</p>
            <p className="text-xs">{order.shippingAddress}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          Last updated: {formatDate(order.updatedAt.toString())}
        </span>

        <Link
          href={`/order/${order.id}`}
          className="text-xs font-medium underline underline-offset-4"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
};
