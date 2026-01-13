"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/server/services/invoice-template";
import { Button } from "@/components/ui/button";

import { type AppRouter } from "@/server/api/root";
import { type inferProcedureOutput } from "@trpc/server";

type Order = inferProcedureOutput<AppRouter["order"]["getById"]>;

export default function DownloadInvoiceButton({ order }: { order: Order }) {
  return (
    <PDFDownloadLink
      document={
        <InvoiceTemplate
          orderId={order.orderId}
          date={new Date(order.createdAt)}
          address={order.shippingAddress ?? ""}
          items={order.orderItems.map((item) => ({
            name: item.productName ?? "Unknown Product",
            quantity: item.quantity,
            price: Number(item.unitPrice) || 0,
            discountPercent: Number(item.discountPercent) || 0,
            subtotal: Number(item.subtotal) || 0,
          }))}
          total={Number(order.totalAmount) || 0}
        />
      }
      fileName={`invoice-${order.orderId}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <Button onClick={(e) => e.stopPropagation()}>
          {loading ? "Generating..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
