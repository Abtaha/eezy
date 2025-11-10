"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { useCart } from "@/context/cart-context";

export const CartComponent = () => {
  const { cart, removeItem, total } = useCart();

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-xl border p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-3"
            >
              <div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  ${item.price} × {item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              ${total.toFixed(2)}
            </span>
          </div>

          <Button className="mt-4 w-full rounded-full bg-black text-white hover:bg-gray-800">
            Proceed to Checkout
          </Button>
        </div>
      )}
    </div>
  );
};
