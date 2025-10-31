"use client";

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t bg-white pt-6 shadow-sm">
      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 py-6 text-gray-700 md:grid-cols-2">
        {/* Brand Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clothing Store</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Discover the latest trends in fashion and elevate your everyday
            style.
          </p>
        </div>

        {/* Links */}
        <div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="transition hover:text-blue-600">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-blue-600">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t py-3 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Clothing Store. All rights reserved.
      </div>
    </footer>
  );
};
