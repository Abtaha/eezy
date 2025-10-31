"use client";

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white border-t shadow-sm mt-6">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        {/* Brand Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clothing Store</h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Discover the latest trends in fashion and elevate your everyday style.
          </p>
        </div>

        {/* Links */}
        <div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-blue-600 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-600 transition">
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
