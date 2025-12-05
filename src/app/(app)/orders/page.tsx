import { OrderCard } from "@/components/order-card";
import { dummyOrders } from "@/lib/order-dummyData";

export default function OrdersPage() {
  // change dummy with db later
  const orders = dummyOrders;

  return (
    <main className="mx-auto flex w-full max-w-3xl min-h-[130vh] flex-col gap-6 p-4 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>
        <p className="text-sm text-muted-foreground">
          View your past and current orders, their status, and totals.
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">You have no orders yet.</p>
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

