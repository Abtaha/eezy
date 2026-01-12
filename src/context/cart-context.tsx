"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem, disableToast?: boolean) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  mergeCart: (items: CartItem[]) => void;
  total: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session && !isPending;
  const isGuest = !session && !isPending;

  const hasMerged = useRef(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const utils = api.useUtils();

  const { data: serverCart } = api.cart.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const addItemMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const removeItemMutation = api.cart.removeItem.useMutation({
    onSuccess: () => utils.cart.getCart.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const clearCartMutation = api.cart.clearCart.useMutation({
    onSuccess: () => utils.cart.getCart.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const mergeCartMutation = api.cart.mergeCart.useMutation({
    onSuccess: () => {
      localStorage.removeItem("eezy-cart");
      utils.cart.getCart.invalidate();
      toast.success("Cart merged successfully");
    },
    onError: (err) => toast.error("Failed to merge cart: " + err.message),
  });

  useEffect(() => {
    if (isGuest) {
      const stored = localStorage.getItem("eezy-cart");
      if (stored) setCart(JSON.parse(stored));
    }
  }, [isGuest]);

  useEffect(() => {
    if (isAuthenticated && serverCart) {
      const mappedItems: CartItem[] = serverCart.items.map((item) => ({
        id: item.productID,
        name: item.product.name,
        price: Number(item.product.price),
        discount: Number(item.product.discountPercentage),
        quantity: item.quantity,
      }));

      setCart((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(mappedItems)) {
          return mappedItems;
        }
        return prev;
      });
    }
  }, [serverCart, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !hasMerged.current) {
      const stored = localStorage.getItem("eezy-cart");

      if (stored) {
        const localItems: CartItem[] = JSON.parse(stored);

        if (localItems.length > 0) {
          hasMerged.current = true;
          localStorage.removeItem("eezy-cart");

          mergeCartMutation.mutate(
            localItems.map((i) => ({ id: i.id, quantity: i.quantity })),
            {
              onError: () => {
                localStorage.setItem("eezy-cart", stored);
                toast.error("Failed to merge cart. Please try again.");
              },
            },
          );
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isGuest) {
      localStorage.setItem("eezy-cart", JSON.stringify(cart));
    }
  }, [cart, isGuest]);

  const addItem = (item: CartItem, disableToast = false) => {
    if (isAuthenticated) {
      addItemMutation.mutate({ productId: item.id, quantity: item.quantity });
    } else {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        }
        return [...prev, item];
      });
    }

    if (!disableToast) {
      toast.success("Item added to cart");
    }
  };

  const removeItem = (id: string) => {
    if (isAuthenticated) {
      removeItemMutation.mutate({ productId: id });
    } else {
      setCart((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      setCart([]);
      localStorage.removeItem("eezy-cart");
    }
  };

  const mergeCart = (items: CartItem[]) => {
    if (isAuthenticated) {
      mergeCartMutation.mutate(
        items.map((i) => ({ id: i.id, quantity: i.quantity })),
      );
    } else {
      setCart((prev) => {
        const merged = [...prev];
        items.forEach((item) => {
          const existing = merged.find((i) => i.id === item.id);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
      toast.success("Carts merged");
    }
  };

  const total = cart.reduce(
    (sum, item) =>
      sum +
      (item.discount > 0
        ? item.price * (1 - item.discount / 100)
        : item.price) *
        item.quantity,
    0,
  );

  const totalCount = cart.reduce(
    (sum, item) => 
      sum + item.quantity, 
    0,
  );

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, clearCart, mergeCart, total, totalCount, }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
