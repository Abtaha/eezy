import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";


import { Header } from "@/components/ui/layout-components/header";
import { Footer } from "@/components/ui/layout-components/footer";

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
    <html lang="en" className={`${geist.variable} dark`}>
      <body className="bg-white text-black flex flex-col min-h-screen">
        <Header />
        <main className="grow">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
        <Footer />
      </body>
    </html>
  );
}
