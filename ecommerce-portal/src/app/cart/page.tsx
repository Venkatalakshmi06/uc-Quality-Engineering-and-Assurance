"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItemCard from "@/components/CartItemCard";

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 data-testid="cart-title" className="text-3xl font-bold text-gray-900 mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div data-testid="empty-cart" className="text-center py-16">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          <p className="text-gray-500 text-lg mt-4">Your cart is empty</p>
          <Link
            href="/"
            data-testid="continue-shopping"
            className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <CartItemCard key={item.product.id} item={item} />
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg text-gray-600">Subtotal</span>
              <span data-testid="cart-subtotal" className="text-lg font-medium text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg text-gray-600">Shipping</span>
              <span className="text-lg font-medium text-green-600">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span data-testid="cart-total" className="text-xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                data-testid="clear-cart"
                onClick={clearCart}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Cart
              </button>
              <Link
                href="/checkout"
                data-testid="proceed-to-checkout"
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
