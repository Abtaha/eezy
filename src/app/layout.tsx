import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { CartProvider } from "@/context/cart-context";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Eezy",
  description: "Eezy Shopping Store",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <CartProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </CartProvider>
      </body>
    </html>
  );
}
