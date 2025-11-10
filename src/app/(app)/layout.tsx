import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Header } from "@/components/layout-components/header";
import { Footer } from "@/components/layout-components/footer";
import { CartProvider } from "@/context/cart-context";

export const metadata: Metadata = {
  title: "Eezy",
  description: "Eezy Shopping Store",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={geist.variable}>
      <Header />
      <main className="grow">
        <CartProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </CartProvider>
      </main>
      <Footer />
    </div>
  );
}

