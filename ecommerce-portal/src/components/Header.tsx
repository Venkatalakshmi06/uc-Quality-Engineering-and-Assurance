"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="logo" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">ShopHub</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              data-testid="nav-home"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              href="/cart"
              data-testid="nav-cart"
              className="relative text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Cart
              {totalItems > 0 && (
                <span
                  data-testid="cart-badge"
                  className="absolute -top-2 -right-4 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
