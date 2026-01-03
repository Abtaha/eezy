import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SalesManagerPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sales Manager Admin Panel</h2>
      <p className="text-muted-foreground text-sm">
        Choose what you want to manage.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/comments" className="block h-full">
            <CardHeader>
              <CardTitle>Discounts</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Manage discounts.
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/orders" className="block h-full">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Manage invoices.
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
