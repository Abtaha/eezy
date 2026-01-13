"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

export default function Sidebar({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
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
  );
}
