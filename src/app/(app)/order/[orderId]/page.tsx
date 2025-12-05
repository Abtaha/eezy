import { notFound } from "next/navigation";
import { dummyOrders, dummyOrderItems, dummyProducts } from "@/lib/order-dummyData";
import Image from "next/image";

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

  const order = dummyOrders.find((o) => o.id === orderId);

  if (!order) {
    notFound();
  }

  // Join product and orderItems tables later to get product name and image from product table with id
const items = dummyOrderItems
  .filter((i) => i.orderId === orderId)
  .map((item) => {
    const p = dummyProducts.find((prod) => prod.id === item.productId);

    return {
      ...item,
      productName: p?.name ?? "Unknown",
      productImage: p?.frontImage ?? "",
    };
  });

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-8 space-y-6 min-h-[130vh]">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Order #{order.id}
        </h1>
        <p className="text-sm text-muted-foreground">
          Placed on {formatDate(order.createdAt)} • Status:{" "}
          <span className="font-medium">{order.status.toUpperCase()}</span>
        </p>
      </header>

      {/* General info */}
      <section className="grid gap-4 rounded-lg border p-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Payment method</p>
          <p>{order.paymentMethod ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tracking number</p>
          <p>{order.trackingNumber ?? "-"}</p>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs text-muted-foreground">Shipping address</p>
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
                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                <th className="px-4 py-2 text-right font-medium">Unit price</th>
                <th className="px-4 py-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      )}
                      <p className="font-medium">{item.productName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.subtotal)}
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

