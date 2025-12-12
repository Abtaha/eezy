// components/admin/admin-header.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const getPanelTitle = (pathname: string) => {
  if (pathname.startsWith("/admin/product")) return "Product Manager Admin Panel";
  if (pathname.startsWith("/admin/sales")) return "Sales Admin Panel";
  if (pathname.startsWith("/admin/support")) return "Support Admin Panel";
  return "Admin Panel";
};

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const title = getPanelTitle(pathname);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        Log out
      </Button>
    </header>
  );
}

