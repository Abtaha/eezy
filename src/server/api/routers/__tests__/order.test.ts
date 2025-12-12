/**
 * @vitest-environment node
 */
// Mock the external service before any imports
import { vi } from "vitest";

vi.mock("@/server/services/send-invoice", () => ({
  processDelivery: vi.fn().mockResolvedValue(undefined),
}));

import { describe, it, expect, beforeEach } from "vitest";
import { clearDatabase } from "@/server/test-utils/db";
import { createTestCaller } from "@/server/test-utils/trpc";
import type { User } from "@/server/auth";
import { product, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import type { InferSelectModel } from "drizzle-orm";

type Product = InferSelectModel<typeof product>;

// Create a factory for generating complete mock user objects
const createMockUser = (role: "user" | "productManager", email: string): User => ({
  id: randomUUID(),
  name: `Test ${role}`,
  email,
  emailVerified: true,
  image: null,
  role,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("Order Router", () => {
  let userCaller: ReturnType<typeof createTestCaller>;
  let managerCaller: ReturnType<typeof createTestCaller>;
  let publicCaller: ReturnType<typeof createTestCaller>;
  let mockUser: User;
  let testProduct: Product;

  beforeEach(async () => {
    await clearDatabase();
    vi.clearAllMocks(); // Clear mocks between tests

    // Create fresh mocks for each test
    mockUser = createMockUser("user", "test-order-user@example.com");
    const mockManager = createMockUser("productManager", "test-order-manager@example.com");

    const userSession = { user: mockUser };
    const managerSession = { user: mockManager };

    // Create fresh callers for each test
    userCaller = createTestCaller({ session: userSession as any });
    managerCaller = createTestCaller({ session: managerSession as any });
    publicCaller = createTestCaller();

    // Create users in the database so foreign key constraints are met
    await db.insert(user).values([mockUser, mockManager]).returning();

    // Create a product to be used in order tests
    testProduct = await managerCaller.product.create({
      productName: "Test T-Shirt",
      productModel: "CoolModel-X",
      productQuantityInStock: 10,
      productCategory: "Apparel",
      productPrice: 2500,
      productWarrantyStatus: true,
      productFrontImage: "/test-front.jpg",
      productBackImage: "/test-back.jpg",
      productDistributor: "Test Distributor",
    });
  });

  it("should create a new order and decrease product stock", async () => {
    const orderInput = {
      items: [{ productId: testProduct.id, quantity: 2 }],
      shippingAddress: "123 Test St, Testville, TS 12345",
      paymentMethod: "Credit Card",
    };

    const result = await userCaller.order.create(orderInput);
    expect(result.orderId).toBeDefined();
    expect(result.status).toBe("processing");

    // Verify order in DB
    const order = await userCaller.order.getById({ orderId: result.orderId });
    expect(order.orderItems).toHaveLength(1);
    expect(order.orderItems[0].quantity).toBe(2);

    // Verify stock was updated
    const product = await publicCaller.product.get({ id: testProduct.id });
    expect(product.quantityInStock).toBe(8);
  });

  it("should throw an error if stock is insufficient", async () => {
    const orderInput = {
      items: [{ productId: testProduct.id, quantity: 11 }], // 1 more than in stock
      shippingAddress: "123 Test St",
      paymentMethod: "Credit Card",
    };

    await expect(userCaller.order.create(orderInput)).rejects.toThrow(
      new TRPCError({
        code: "NOT_FOUND",
        message: "This quantity of product Test T-Shirt is not in stock",
      })
    );
  });

  it("should allow a productManager to update order status", async () => {
    const order = await userCaller.order.create({
      items: [{ productId: testProduct.id, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "Credit Card",
    });

    await managerCaller.order.updateStatus({
      orderId: order.orderId,
      status: "delivered",
    });

    const updatedOrder = await userCaller.order.getById({
      orderId: order.orderId,
    });
    expect(updatedOrder.status).toBe("delivered");
  });

  it("should prevent a regular user from updating order status", async () => {
    const order = await userCaller.order.create({
      items: [{ productId: testProduct.id, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "Credit Card",
    });

    await expect(
      userCaller.order.updateStatus({
        orderId: order.orderId,
        status: "delivered",
      })
    ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
  });

  it("should get all orders for a user", async () => {
    await userCaller.order.create({
      items: [{ productId: testProduct.id, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "Credit Card",
    });
    await userCaller.order.create({
      items: [{ productId: testProduct.id, quantity: 2 }],
      shippingAddress: "456 Other St",
      paymentMethod: "PayPal",
    });

    const allOrders = await userCaller.order.getAll();
    expect(allOrders).toHaveLength(2);
  });
});
