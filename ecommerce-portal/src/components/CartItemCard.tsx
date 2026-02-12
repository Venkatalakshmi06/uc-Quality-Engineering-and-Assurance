"use client";

import { CartItem } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div
      data-testid={`cart-item-${item.product.id}`}
      className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200"
    >
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1">
        <h3
          data-testid={`cart-item-name-${item.product.id}`}
          className="font-semibold text-gray-900"
        >
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500">{item.product.category}</p>
        <p
          data-testid={`cart-item-price-${item.product.id}`}
          className="font-bold text-gray-900 mt-1"
        >
          ${item.product.price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          data-testid={`decrease-qty-${item.product.id}`}
          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          -
        </button>
        <span
          data-testid={`item-quantity-${item.product.id}`}
          className="w-8 text-center font-medium text-gray-900"
        >
          {item.quantity}
        </span>
        <button
          data-testid={`increase-qty-${item.product.id}`}
          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <button
        data-testid={`remove-item-${item.product.id}`}
        onClick={() => removeFromCart(item.product.id)}
        className="text-red-500 hover:text-red-700 p-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
