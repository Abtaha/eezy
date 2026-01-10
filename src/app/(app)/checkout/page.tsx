"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useCheckout } from "@/hooks/use-checkout";

// Luhn Algorithm for credit card validation
function isValidCardNumber(cardNumber: string): boolean {
  // Remove spaces and non-digits
  const digits = cardNumber.replace(/\D/g, "");

  // Card must be 13-19 digits
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]!);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export default function CheckoutPage() {
  const { cart, addItem, removeItem, clearCart, total } = useCart();
  const { handleCheckout, isLoading } = useCheckout();
  const router = useRouter();

  // Payment form state
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Handle quantity increase
  const increaseQuantity = (item: any) => {
    addItem({ ...item, quantity: 1 });
  };

  // Handle quantity decrease
  const decreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      removeItem(item.id);
      addItem({ ...item, quantity: item.quantity - 1 }); // No setTimeout
    } else {
      removeItem(item.id);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });

    // Validate payment info
    if (
      !paymentInfo.cardName ||
      !paymentInfo.cardNumber ||
      !paymentInfo.expiryDate ||
      !paymentInfo.cvv
    ) {
      toast.error("Please fill in all payment details");
      return;
    }

    let hasError = false;

    // Validate card number with Luhn algorithm
    if (!isValidCardNumber(paymentInfo.cardNumber)) {
      setErrors((prev) => ({ ...prev, cardNumber: "Invalid card number" }));
      hasError = true;
    }

    // Validate expiry date format
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(paymentInfo.expiryDate)) {
      setErrors((prev) => ({ ...prev, expiryDate: "Use MM/YY format" }));
      hasError = true;
    }

    // Validate CVV (3 digits)
    if (paymentInfo.cvv.length !== 3) {
      setErrors((prev) => ({ ...prev, cvv: "Must be 3 digits" }));
      hasError = true;
    }

    if (hasError) return;

    try {
      await handleCheckout(paymentInfo.billingAddress, "Credit Card");
      toast.success(`Order placed successfully! 🎉`);
      clearCart();

      router.push("/orders");
    } catch {
      toast.error("Failed to place order.");
    }
  };

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mb-8 text-gray-600">
          Add some items to your cart to checkout!
        </p>
        <Button
          onClick={() => router.push("/store")}
          className="rounded-full bg-black hover:bg-gray-800"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items - Left Side (2 columns) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                >
                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      $
                      {(item.discount > 0
                        ? item.price * (1 - item.discount / 100)
                        : item.price
                      ).toFixed(2)}{" "}
                      each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => decreaseQuantity(item)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => increaseQuantity(item)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Item Total */}
                  <div className="flex items-center gap-4">
                    <span className="w-20 text-right font-semibold text-gray-900">
                      $
                      {(
                        (item.discount > 0
                          ? item.price * (1 - item.discount / 100)
                          : item.price) * item.quantity
                      ).toFixed(2)}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Total */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold text-gray-900">
                Total:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form - Right Side (1 column) */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handlePlaceOrder}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Payment Information
            </h2>

            <div className="space-y-4">
              {/* Card Name */}
              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={paymentInfo.cardName}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, cardName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={paymentInfo.cardNumber}
                  onChange={(e) => {
                    // Format card number with spaces
                    const value = e.target.value.replace(/\s/g, "");
                    const formatted =
                      value.match(/.{1,4}/g)?.join(" ") || value;
                    setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
                    // Clear error when typing
                    if (errors.cardNumber) {
                      setErrors({ ...errors, cardNumber: "" });
                    }
                  }}
                  className={errors.cardNumber ? "border-red-500" : ""}
                  required
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={paymentInfo.expiryDate}
                  onChange={(e) => {
                    // Format expiry date
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + "/" + value.slice(2, 4);
                    }
                    setPaymentInfo({ ...paymentInfo, expiryDate: value });
                    // Clear error when typing
                    if (errors.expiryDate) {
                      setErrors({ ...errors, expiryDate: "" });
                    }
                  }}
                  className={errors.expiryDate ? "border-red-500" : ""}
                  required
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={3}
                  value={paymentInfo.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPaymentInfo({ ...paymentInfo, cvv: value });
                    // Clear error when typing
                    if (errors.cvv) {
                      setErrors({ ...errors, cvv: "" });
                    }
                  }}
                  className={errors.cvv ? "border-red-500" : ""}
                  required
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                )}
              </div>

              {/* Billing Address */}
              <div>
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  placeholder="123 Main St"
                  value={paymentInfo.billingAddress}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      billingAddress: e.target.value,
                    })
                  }
                />
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Istanbul"
                    value={paymentInfo.city}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, city: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="34000"
                    value={paymentInfo.postalCode}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                className="mt-6 w-full rounded-full bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                Place Order - ${total.toFixed(2)}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
