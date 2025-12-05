import { api } from "@/trpc/server";
import { OrderCard } from "@/components/order-card";

export default async function OrdersPage() {
  const orders = await api.order.getAll();

  return (
    <main className="mx-auto flex min-h-[130vh] w-full max-w-3xl flex-col gap-6 p-4 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>
        <p className="text-muted-foreground text-sm">
          View your past and current orders, their status, and totals.
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">You have no orders yet.</p>
      ) : (
        <section className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      )}
    </main>
  );
}
