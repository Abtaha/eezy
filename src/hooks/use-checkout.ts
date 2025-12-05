"use client";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useCart } from "@/context/cart-context";

export function useCheckout() {
  const { cart, clearCart } = useCart();
  const createOrderMutation = api.order.create.useMutation();

  const handleCheckout = async () => {
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    if (items.length === 0) return;

    try {
      const order = await createOrderMutation.mutateAsync({
        shippingAddress: "Sabancı University, Tuzla / İstanbul, Turkey",
        paymentMethod: "Credit Card",
        items,
      });

      toast.success(`Order created. ID: ${order.orderId}`);
      clearCart();
    } catch {
      toast.error("Failed to create order.");
    }
  };

  return { handleCheckout, isLoading: createOrderMutation.isPending };
}
