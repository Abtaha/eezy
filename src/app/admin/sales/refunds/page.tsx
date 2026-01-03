import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import RefundRequestsTable from "./RefundRequestsTable";

export default async function SalesManagerRefundsPage() {
  try {
    const rows = await api.order.refundRequestsList();

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Refund requests</h1>
          <p className="text-muted-foreground text-sm">
            Review pending refund requests.
          </p>
        </header>

        <RefundRequestsTable initialRows={rows} />
      </main>
    );
  } catch {
    notFound();
  }
}
