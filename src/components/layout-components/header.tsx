"use client";

import Link from "next/link";
import { ShoppingCart, ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartComponent } from "@/components/cart-component";

import { UserMenu } from "@/components/layout-components/user-menu";
import { HeaderSearch } from "@/components/layout-components/header-search";

import { useCart } from "@/context/cart-context";

export const Header = () => {
  const { cart } = useCart();
  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      {/* Logo and Brand Name */}
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <Link
          href="/"
          className="flex items-center space-x-2 transition hover:text-blue-600"
        >
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">
            Clothing Store
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          {/* Search moved to its own component */}
          <HeaderSearch />

          <UserMenu />

          {/* Shopping Cart (slide-in drawer) */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open cart"
                className="relative transition hover:text-blue-600"
              >
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />

                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      {cart.length}
                    </span>
                  )}
                </div>
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full p-0 sm:w-[420px]">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>

                {/* Cart list */}
                <div className="mt-4">
                  <CartComponent />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
