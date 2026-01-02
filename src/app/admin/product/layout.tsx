"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const items = [
  { href: "/admin/product/comments", label: "Comments" },
  { href: "/admin/product/orders", label: "Orders" },
  { href: "/admin/product/manage-products", label: "Products" },
];

export default function ProductAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Sidepanel */}
      <aside className="bg-muted/40 w-56 space-y-2 border-r p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "bg-background font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-background/60",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
