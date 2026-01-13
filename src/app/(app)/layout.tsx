import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Header } from "@/components/layout-components/header";
import { Footer } from "@/components/layout-components/footer";
import { CartProvider } from "@/context/cart-context";

import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";

export const metadata: Metadata = {
  title: "Eezy",
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

  if (session?.user && session.user.role !== "user") {
    redirect("/admin");
  }

  return (
    <CartProvider>
      <div className={geist.variable}>
        <Header />
        <main className="grow">{children}</main>
        <ChatWidget />
        <Footer />
      </div>
    </CartProvider>
  );
}
