"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Heart,
  User,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function UserContextPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const { data: user, isLoading } =
    api.conversation.getChatUserDetails.useQuery(
      { conversationId },
      { enabled: !!conversationId },
    );

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // --- GUEST STATE ---
  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center dark:bg-zinc-950">
        <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
          <AlertCircle className="h-10 w-10 text-orange-600 dark:text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Guest User
        </h1>
        <p className="max-w-md text-gray-500">
          This conversation is not linked to a registered account.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Chat
        </Button>
      </div>
    );
  }

  // --- CALCULATE STATS ---
  const totalSpent = user.orders.reduce(
    (acc, order) => acc + Number(order.totalAmount),
    0,
  );
  const totalOrders = user.orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const cartItemCount =
    user.cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartTotal =
    user.cart?.items.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0,
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* TOP NAV */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Customer 360° View
          </h1>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: User Profile & Quick Stats (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Profile Card */}
            <Card className="overflow-hidden border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
              <CardContent className="relative pt-0 pb-6">
                <Avatar className="absolute -top-12 left-6 h-24 w-24 border-4 border-white shadow-md dark:border-zinc-900">
                  <AvatarImage src={user.image ?? ""} />
                  <AvatarFallback className="bg-zinc-100 text-2xl font-bold text-zinc-600">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-14 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <Badge
                      variant={user.emailVerified ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {new Date(user.createdAt).getFullYear()}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Lifetime Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Total Spent
                    </p>
                    <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      {totalSpent.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Avg. Order
                    </p>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ${averageOrderValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Total Orders
                    </p>
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                      <Package className="h-4 w-4 text-blue-600" />
                      {totalOrders}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Wishlist
                    </p>
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                      <Heart className="h-4 w-4 text-pink-600" />
                      {user.wishlists?.items.length || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Cart Section */}
            <Card className="border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="bg-zinc-50/50 pb-4 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-base">Active Cart</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {cartItemCount} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  {!user.cart || user.cart.items.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                      Cart is empty
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {user.cart.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <img
                            src={item.product.frontImage}
                            alt={item.product.name}
                            className="h-12 w-12 rounded-md border bg-white object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ${item.product.price}
                            </p>
                          </div>
                          <div className="text-sm font-semibold">
                            $
                            {(
                              Number(item.product.price) * item.quantity
                            ).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {user.cart && user.cart.items.length > 0 && (
                  <div className="flex items-center justify-between border-t bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <span className="text-sm font-medium text-gray-600">
                      Total Value
                    </span>
                    <span className="text-lg font-bold">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Tabs for Orders & Wishlist (8 cols) */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="h-auto w-full justify-start rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <TabsTrigger
                  value="orders"
                  className="flex-1 gap-2 py-2 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800"
                >
                  <Package className="h-4 w-4" />
                  Orders ({user.orders.length})
                </TabsTrigger>
                <TabsTrigger
                  value="wishlist"
                  className="flex-1 gap-2 py-2 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist ({user.wishlists?.items.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* --- ORDERS TAB --- */}
              <TabsContent value="orders" className="mt-6 space-y-4">
                {user.orders.length === 0 ? (
                  <Card className="flex h-64 flex-col items-center justify-center border-dashed text-gray-500">
                    <Package className="mb-3 h-12 w-12 opacity-20" />
                    <p>No order history available</p>
                  </Card>
                ) : (
                  user.orders.map((order) => (
                    <Card
                      key={order.id}
                      className="overflow-hidden border-zinc-200 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              Order #{order.id.slice(0, 8)}
                            </span>
                            <Badge
                              className={
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }
                            >
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            ${order.totalAmount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.paymentMethod || "Credit Card"}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-0">
                        {/* Address Section */}
                        {order.shippingAddress && (
                          <div className="flex items-start gap-2 border-b bg-white p-3 text-sm text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <span>{order.shippingAddress}</span>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-4"
                            >
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-gray-100">
                                <img
                                  src={item.product.frontImage}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {item.product.name}
                                  </h4>

                                  {/* REFUND BADGE */}
                                  {(item.refunds[0]?.status === "approved" ||
                                    item.refunds[0]?.status === "refunded") && (
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${"bg-green-100 text-green-700"}`}
                                    >
                                      {item.refunds[0]?.status === "approved"
                                        ? "Refund Approved"
                                        : "Refunded"}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  Model: {item.product.model}
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">
                                  ${Number(item.unitPrice).toFixed(2)}
                                </div>
                                <div className="text-gray-500">
                                  Qty: {item.quantity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* --- WISHLIST TAB --- */}
              <TabsContent value="wishlist" className="mt-6">
                {!user.wishlists?.items.length ? (
                  <Card className="flex h-64 flex-col items-center justify-center border-dashed text-gray-500">
                    <Heart className="mb-3 h-12 w-12 opacity-20" />
                    <p>Wishlist is empty</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {user.wishlists.items.map((item) => (
                      <Card
                        key={item.id}
                        className="group overflow-hidden border-zinc-200 transition-all hover:border-purple-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={item.product.frontImage}
                            alt={item.product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-pink-500 shadow-sm">
                            <Heart className="h-3.5 w-3.5 fill-current" />
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.product.name}
                          </h4>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold">
                              ${item.product.price}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Added{" "}
                              {new Date(item.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
