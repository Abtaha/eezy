import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export default async function SupportAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== "supportAgent") {
    redirect("/admin");
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
