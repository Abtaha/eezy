import Link from "next/link";

export default async function SalesManagerAdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sales Manager</h1>
        <p className="text-muted-foreground text-sm">
          Admin tools for refund approvals and order support.
        </p>
      </header>

      <section className="rounded-lg border p-4">
        <h2 className="text-base font-semibold"></h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/sales/refunds"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Refund requests
          </Link>
        </div>
      </section>
    </main>
  );
}
