import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductManagerPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Product Manager Admin Panel</h2>
      <p className="text-muted-foreground text-sm">
        Choose what you want to manage.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/comments" className="block h-full">
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Review and approve customer comments.
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/orders" className="block h-full">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Update order statuses.
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Row 2: Products (under Comments) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/manage-products" className="block h-full">
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Add/remove products and manage stock.
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/category" className="block h-full">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Manage product categories.
            </CardContent>
          </Link>
        </Card>
        <div />
      </div>
    </div>
  );
}
