import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import Sidebar from "@/components/admin/sidebar";

const items = [
  { href: "/admin/sales/discount", label: "Discounts" },
  { href: "/admin/sales/invoices", label: "Invoices" },
];

export default async function SalesAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== "salesManager") {
    redirect("/admin");
  }

  return (
    <div className="flex h-full">
      {/* Sidepanel */}
      <Sidebar items={items} />

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
