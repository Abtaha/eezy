import { notFound } from "next/navigation";
import Image from "next/image";
import { api } from "@/trpc/server";

import OrderItemActions from "./OrderItemActions";
import OrderCancelButton from "./OrderCancelButton";

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

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  let order;
  try {
    order = await api.order.getById({ orderId });
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto min-h-[130vh] w-full max-w-3xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Order #{order.orderId}
          </h1>
          <p className="text-muted-foreground text-sm">
            Placed on {formatDate(order.createdAt.toString())} • Status:{" "}
            <span className="font-medium">{order.status.toUpperCase()}</span>
          </p>
        </div>

        <OrderCancelButton orderId={order.orderId} status={order.status} />
      </header>

      {/* General info */}
      <section className="grid gap-4 rounded-lg border p-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-xs">Total</p>
          <p className="font-medium">
            {formatCurrency(parseFloat(order.totalAmount))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Payment method</p>
          <p>{order.paymentMethod ?? "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Tracking number</p>
          <p>{order.trackingNumber ?? "-"}</p>
        </div>
        <div className="md:col-span-3">
          <p className="text-muted-foreground text-xs">Shipping address</p>
          <p>{order.shippingAddress ?? "-"}</p>
        </div>
      </section>

      {/* Items */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Product</th>
                <th className="px-4 py-2 text-right font-medium">Qty</th>
                <th className="px-4 py-2 text-right font-medium">Unit</th>
                <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                <th className="px-4 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      )}
                      <p className="font-medium">{item.productName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(parseFloat(item.unitPrice))}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(parseFloat(item.subtotal))}
                  </td>
                  <td className="px-4 py-2">
                    <OrderItemActions
                      orderId={order.orderId}
                      orderStatus={order.status}
                      orderCreatedAtMs={new Date(order.createdAt.toString()).getTime()}
                      itemId={item.id}
                      itemSubtotal={item.subtotal}
                      refundStatus={item.refundStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
