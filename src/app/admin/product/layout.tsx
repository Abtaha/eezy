import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import Sidebar from "@/components/admin/sidebar";

const items = [
  { href: "/admin/product/comments", label: "Comments" },
  { href: "/admin/product/orders", label: "Orders" },
  { href: "/admin/product/manage-products", label: "Products" },
  { href: "/admin/product/category", label: "Categories" },
];

export default async function ProductAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== "productManager") {
    redirect("/admin");
  }

  return (
    <div className="flex h-full">
      {/* Sidepanel */}
      {<Sidebar items={items} />}

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
