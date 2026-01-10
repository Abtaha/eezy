import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata: Metadata = {
  title: "Eezy - Admin",
  description: "Eezy Shopping Store",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session?.user ||
    !(
      session.user.role === "salesManager" ||
      session.user.role === "supportAgent" ||
      session.user.role === "productManager"
    )
  ) {
    redirect("/login");
  }

  return (
    <div className={geist.variable}>
      <div className="bg-background flex min-h-screen flex-col">
        <AdminHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
