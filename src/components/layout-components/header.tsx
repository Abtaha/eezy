"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Search } from "lucide-react";
import { ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartComponent } from "@/components/cart-component";

import { UserMenu } from "@/components/layout-components/user-menu";

type DropdownMenuProps = {
  title: string;
  href: string;
  items: DropdownItem[];
};

type DropdownItem = {
  href: string;
  label: string;
};

const DropdownMenu = ({ title, href, items }: DropdownMenuProps) => (
  <div className="group relative">
    <Link
      href={href}
      className="flex items-center gap-1 transition-colors hover:text-blue-600"
    >
      {title}
      <svg
        className="h-4 w-4 transition-transform group-hover:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </Link>

    <div className="absolute top-full left-0 h-2 w-full opacity-0 group-hover:opacity-0" />

    <div className="pointer-events-none invisible absolute top-[110%] left-1 w-[420px] translate-y-2 pt-2 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg before:absolute before:-top-2 before:left-8 before:h-1.5 before:w-1.5 before:rotate-45 before:border-t before:border-l before:border-gray-200 before:bg-white before:shadow-lg before:content-['']">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-4 py-3 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);

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

        {/* Categories */}
        <div className="hidden space-x-6 md:flex">
          <DropdownMenu
            title="Women"
            href="/category/women"
            items={[
              { href: "/category/women/dresses", label: "Dresses" },
              { href: "/category/women/tops", label: "Tops" },
              { href: "/category/women/pants", label: "Pants" },
              { href: "/category/women/skirts", label: "Skirts" },
              { href: "/category/women/shoes", label: "Shoes" },
              { href: "/category/women/bags", label: "Bags" },
              { href: "/category/women/jewelry", label: "Jewelry" },
              { href: "/category/women/accessories", label: "Accessories" },
            ]}
          />

          <DropdownMenu
            title="Men"
            href="/category/men"
            items={[
              { href: "/category/men/shirts", label: "Shirts" },
              { href: "/category/men/t-shirts", label: "T-Shirts" },
              { href: "/category/men/pants", label: "Pants" },
              { href: "/category/men/jackets", label: "Jackets" },
              { href: "/category/men/shoes", label: "Shoes" },
              { href: "/category/men/watches", label: "Watches" },
              { href: "/category/men/belts", label: "Belts" },
              { href: "/category/men/accessories", label: "Accessories" },
            ]}
          />

          <DropdownMenu
            title="Kids"
            href="/category/kids"
            items={[
              { href: "/category/kids/t-shirts", label: "T-Shirts" },
              { href: "/category/kids/pants", label: "Pants" },
              { href: "/category/kids/jackets", label: "Jackets" },
              { href: "/category/kids/shoes", label: "Shoes" },
            ]}
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="group relative flex items-center">
            <input
              type="text"
              placeholder="Search..."
              className={`absolute right-8 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none ${searchOpen ? "visible w-48 opacity-100" : "invisible w-0 opacity-0"}`}
            />
            <Search
              className="h-6 w-6 cursor-pointer hover:text-blue-600"
              onClick={() => setSearchOpen(!searchOpen)}
            ></Search>
          </div>

          <UserMenu />

          {/* Shopping Cart (slide-in drawer) */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open cart"
                className="relative transition hover:text-blue-600"
              >
                <ShoppingCart className="h-6 w-6" />
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
