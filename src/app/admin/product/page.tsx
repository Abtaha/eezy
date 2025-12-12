import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function ProductManagerPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Product Manager Admin Panel</h2>
      <p className="text-sm text-muted-foreground">
        Choose what you want to manage.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/comments" className="block h-full">
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Review and approve customer comments.
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/60 transition">
          <Link href="/admin/product/orders" className="block h-full">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Update order statuses.
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}

