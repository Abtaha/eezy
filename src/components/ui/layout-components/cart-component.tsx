"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export const CartComponent = () => {
  // Example cart items
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "White Shirt", price: 40, quantity: 1 },
    { id: 2, name: "Blue Jeans", price: 60, quantity: 2 },
  ]);

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 mt-10 border">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Cart</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
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
                <span className="text-gray-900 font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              ${total.toFixed(2)}
            </span>
          </div>

          <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-full mt-4">
            Proceed to Checkout
          </Button>
        </div>
      )}
    </div>
  );
};
