import type { Order } from "@/components/order-card";

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export const dummyProducts = [
  {
    id: "p1",
    name: "Black Hoodie",
    model: "HOODIE-BLK-2024",
    frontImage: "/store-images/hoodie-black-front.jpg",
    backImage: "/store-images/hoodie-black-back.jpg",
    serialNumber: 1,
    description: "A warm and stylish black hoodie",
    quantityInStock: 10,
    price: 100.00,
    warrantyStatus: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "p2",
    name: "Black Cargo Pants",
    model: "CARGO-BLK-2024",
    frontImage: "/store-images/cargo-black-front.jpg",
    backImage: "/store-images/cargo-black-back.jpg",
    serialNumber: 2,
    description: "Durable cargo pants with modern fit",
    quantityInStock: 15,
    price: 100.00,
    warrantyStatus: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "p3",
    name: "White T-Shirt",
    model: "TEE-WHT-2024",
    frontImage: "/store-images/white-tee-front.jpg",
    backImage: "/store-images/white-tee-back.jpg",
    serialNumber: 3,
    description: "Simple and clean white cotton tee",
    quantityInStock: 25,
    price: 50.00,
    warrantyStatus: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];


export const dummyOrders: Order[] = [
  {
    id: "0001",
    status: "delivered",
    totalAmount: 200.00,
    createdAt: "2025-01-01T14:20:00Z",
    updatedAt: "2025-01-04T10:00:00Z",
    shippingAddress: "Sabancı University, Tuzla / İstanbul, Turkey",
    paymentMethod: "Credit Card",
    trackingNumber: "TRK1",
  },
  {
    id: "0002",
    status: "processing",
    totalAmount: 50.00,
    createdAt: "2025-01-10T09:35:00Z",
    updatedAt: "2025-01-11T11:10:00Z",
    shippingAddress: "Sabancı University, Tuzla / İstanbul, Turkey",
    paymentMethod: "Credit Card",
    trackingNumber: "TRK2",
  },
];

export const dummyOrderItems: OrderItem[] = [
  {
    id: "item-1",
    orderId: dummyOrders[0]!.id,
    productId: "p1",
    quantity: 1,
    unitPrice: 100.00,
    subtotal: 100.00,
  },
  {
    id: "item-2",
    orderId: dummyOrders[0]!.id,
    productId: "p2",
    quantity: 1,
    unitPrice: 100.00,
    subtotal: 100.00,
  },
  {
    id: "item-3",
    orderId: dummyOrders[1]!.id,
    productId: "p3",
    quantity: 1,
    unitPrice: 50.00,
    subtotal: 50.00,
  },
];
