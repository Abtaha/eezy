"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Search } from "lucide-react";
import { ShoppingBag } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CartComponent } from "@/components/ui/layout-components/cart-component";


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
  <div className="relative group">
    <Link href={href} className="hover:text-blue-600 transition-colors flex items-center gap-1">
      {title}
      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
      </svg>
    </Link>

    <div className="absolute left-0 top-full w-full h-2 opacity-0 group-hover:opacity-0" />

    <div className="absolute left-1 top-[110%] pt-2 w-[420px] opacity-0 invisible 
                    translate-y-2 group-hover:opacity-100 group-hover:visible 
                    group-hover:translate-y-0 transition-all duration-200 ease-out 
                    pointer-events-none group-hover:pointer-events-auto">

      <div className="bg-white border border-gray-200 rounded-lg shadow-lg grid grid-cols-2 gap-1 p-2 before:content-[''] 
                        before:absolute before:left-8 before:-top-2 before:w-1.5 before:h-1.5 before:bg-white before:border-l 
                        before:border-t before:border-gray-200 before:rotate-45 before:shadow-lg">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors">
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
        <Link href="/" className="flex items-center space-x-2 hover:text-blue-600 transition">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-lg text-gray-900">Clothing Store</span>
        </Link>

        {/* Categories */}
        <div className="hidden md:flex space-x-6">

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
            <div className="relative group flex items-center">
              <input type="text" placeholder="Search..."
                className={`
                absolute right-8 border border-gray-300 rounded-full px-3 py-1 text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all duration-300 ease-in-out
                ${searchOpen ? "w-48 opacity-100 visible" : "w-0 opacity-0 invisible"}`}
              />
              <Search className="w-6 h-6 hover:text-blue-600 cursor-pointer" onClick={() => setSearchOpen(!searchOpen)}></Search>
            </div>

            <Link href="/signup" className="bg-gray-400 text-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-500 transition">
                Sign up
            </Link>

            <Link href="/login" className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-600 transition">
                Log in
            </Link>

            {/* Shopping Cart (slide-in drawer) */}
            <Sheet>
                <SheetTrigger asChild>
                    <button
                        aria-label="Open cart"
                        className="relative hover:text-blue-600 transition">
                        <ShoppingCart className="w-6 h-6" />
                    </button>
                </SheetTrigger>

                <SheetContent side="right" className="w-full sm:w-[420px] p-0">
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
