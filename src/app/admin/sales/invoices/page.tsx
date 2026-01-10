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

import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/server/services/invoice-template";

import { type AppRouter } from "@/server/api/root";
import { type inferProcedureOutput } from "@trpc/server";
import { Button } from "@/components/ui/button";

type Invoices = inferProcedureOutput<AppRouter["order"]["getAllAdminSales"]>;

type SortKey = "createdAt_desc" | "createdAt_asc";

export default function ManageInvoicesPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [invoices, setInvoices] = useState<Invoices>([]);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");

  const { data: fetchedInvoices } = api.order.getAllAdminSales.useQuery(
    undefined,
    {
      enabled: !!session,
    },
  );

  useEffect(() => {
    if (fetchedInvoices) {
      setInvoices(fetchedInvoices);
    }
  }, [fetchedInvoices]);

  const sortedInvoices = useMemo(() => {
    const copy = [...invoices];
    switch (sortKey) {
      case "createdAt_asc":
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "createdAt_desc":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [invoices, sortKey]);

  const goToInvoice = (invoiceId: string) => {
    router.push(`/admin/sales/invoices/${invoiceId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Invoices</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Sort by</span>
          <Select
            value={sortKey}
            onValueChange={(value: SortKey) => setSortKey(value)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Sort invoices" />
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
              <th className="px-4 py-2">Invoice ID</th>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                onClick={() => goToInvoice(invoice.id)}
                tabIndex={0}
                className="hover:bg-muted/40 focus:bg-muted/40 cursor-pointer border-t transition-colors outline-none"
              >
                <td className="px-4 py-2 font-mono text-xs">{invoice.id}</td>
                <td className="px-4 py-2">{invoice.userId}</td>
                <td className="text-muted-foreground px-4 py-2 text-xs">
                  {new Date(invoice.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  $ {parseFloat(invoice.totalAmount).toFixed(2)}
                </td>

                <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  <PDFDownloadLink
                    document={
                      <InvoiceTemplate
                        orderId={invoice.id}
                        date={new Date(invoice.createdAt)}
                        address={invoice.shippingAddress ?? ""}
                        items={invoice.orderItems.map((item) => ({
                          name: item.productName ?? "Unknown Product",
                          quantity: item.quantity,
                          price: Number(item.unitPrice) || 0,
                          discountPercent: Number(item.discountPercent) || 0,
                          subtotal: Number(item.subtotal) || 0,
                        }))}
                        total={Number(invoice.totalAmount) || 0}
                      />
                    }
                    fileName={`invoice-${invoice.id}.pdf`}
                    style={{ textDecoration: "none" }}
                  >
                    {({ loading }) => (
                      <Button onClick={(e) => e.stopPropagation()}>
                        {loading ? "Generating..." : "Download PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </td>
              </tr>
            ))}

            {sortedInvoices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-4 py-6 text-center text-sm"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
