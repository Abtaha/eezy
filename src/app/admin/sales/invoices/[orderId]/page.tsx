"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

import { api } from "@/trpc/react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/server/services/invoice-template";

import { type AppRouter } from "@/server/api/root";
import { type inferProcedureOutput } from "@trpc/server";

function formatTR(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  return `$ ${n.toFixed(2)}`;
}

export default function AdminInvoiceDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const { data, isLoading } = api.order.getByIdAdminSales.useQuery(
    { orderId },
    { enabled: !!orderId },
  );

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading…</div>;
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">Order not found.</p>
        <Link
          href="/admin/sales/invoices"
          className="text-sm underline underline-offset-4"
        >
          Back to invoices
        </Link>
      </div>
    );
  }

  const itemCount = data.orderItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Order details</h2>
          <p className="text-muted-foreground font-mono text-xs">
            {data.orderId}
          </p>
        </div>

        <div className="flex items-center gap-x-4">
          <PDFDownloadLink
            document={
              <InvoiceTemplate
                orderId={data.orderId}
                date={new Date(data.createdAt)}
                address={data.shippingAddress ?? ""}
                items={data.orderItems.map((item) => ({
                  name: item.productName ?? "Unknown Product",
                  quantity: item.quantity,
                  price: Number(item.unitPrice) || 0,
                  discountPercent: Number(item.discountPercent) || 0,
                  subtotal: Number(item.subtotal) || 0,
                }))}
                total={Number(data.totalAmount) || 0}
              />
            }
            fileName={`invoice-${data.orderId}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <Button onClick={(e) => e.stopPropagation()}>
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>

          <Link
            href="/admin/sales/invoices"
            className="text-sm underline underline-offset-4"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Created</p>
                <p>{formatTR(data.createdAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="font-medium">{money(data.totalAmount)}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Items</p>
                <p>
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Tracking number</p>
                <p>{data.trackingNumber ?? "-"}</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">
                  Shipping address
                </p>
                <p className="whitespace-pre-wrap">
                  {data.shippingAddress ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Payment method</p>
                <p>{data.paymentMethod ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">User ID</p>
              <p className="font-mono text-xs break-all">{data.user.id}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs">Name</p>
              <p className="font-mono text-xs break-all">{data.user.name}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="font-mono text-xs break-all">{data.user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {data.orderItems.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-4 rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted/30 relative h-12 w-12 overflow-hidden rounded-md border">
                  {it.productImage && (
                    <Image
                      src={it.productImage}
                      alt={it.productName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{it.productName}</p>

                    {/* REFUND BADGE */}
                    {(it.refundStatus === "approved" ||
                      it.refundStatus === "refunded") && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${"bg-green-100 text-green-700"}`}
                      >
                        {it.refundStatus === "approved"
                          ? "Refund Approved"
                          : "Refunded"}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Quantity: {it.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{money(it.subtotal)}</p>
                <p className="text-muted-foreground text-xs">
                  Unit: {money(it.unitPrice)}
                </p>

                {parseFloat(it.discountPercent) > 0 && (
                  <p className="text-muted-foreground text-xs">
                    Discount: {it.discountPercent}%
                  </p>
                )}

                <p className="text-muted-foreground text-xs">
                  Initial Cost: {money(it.productCost)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
