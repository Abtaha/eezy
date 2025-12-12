/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from "vitest";
import { clearDatabase } from "@/server/test-utils/db";
import { createTestCaller } from "@/server/test-utils/trpc";
import type { User } from "@/server/auth";
import { product, user } from "@/server/db/schema";
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

describe("Cart Router", () => {
  let userCaller: ReturnType<typeof createTestCaller>;
  let managerCaller: ReturnType<typeof createTestCaller>;
  let mockUser: User;
  let testProduct: Product;

  beforeEach(async () => {
    await clearDatabase();

    // Create fresh mocks for each test
    mockUser = createMockUser("user", "test-cart-user@example.com");
    const mockManager = createMockUser("productManager", "test-cart-manager@example.com");

    const userSession = { user: mockUser };
    const managerSession = { user: mockManager };

    // Create fresh callers for each test
    userCaller = createTestCaller({ session: userSession as any });
    managerCaller = createTestCaller({ session: managerSession as any });

    // Create users in the database so foreign key constraints are met
    await db.insert(user).values([mockUser, mockManager]).returning();

    // Create a product to be used in cart tests (must be done by a manager)
    testProduct = await managerCaller.product.create({
      productName: "Test T-Shirt",
      productModel: "CoolModel-X",
      productQuantityInStock: 100,
      productCategory: "Apparel",
      productPrice: 2500,
      productWarrantyStatus: true,
      productFrontImage: "/test-front.jpg",
      productBackImage: "/test-back.jpg",
    });
  });

  it("should create and get a new cart for a user", async () => {
    const cart = await userCaller.cart.getCart();
    expect(cart).toBeDefined();
    expect(cart.userID).toBe(mockUser.id);
    expect(cart.items).toHaveLength(0);
  });

  it("should add a new item to the cart", async () => {
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 1 });
    const cart = await userCaller.cart.getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productID).toBe(testProduct.id);
    expect(cart.items[0].quantity).toBe(1);
  });

  it("should increase the quantity of an existing item", async () => {
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 1 });
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 2 });
    const cart = await userCaller.cart.getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });

  it("should update an item's quantity", async () => {
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 1 });
    await userCaller.cart.updateItemQuantity({ productId: testProduct.id, quantity: 5 });
    const cart = await userCaller.cart.getCart();
    expect(cart.items[0].quantity).toBe(5);
  });

  it("should remove an item if quantity is updated to 0", async () => {
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 1 });
    await userCaller.cart.updateItemQuantity({ productId: testProduct.id, quantity: 0 });
    const cart = await userCaller.cart.getCart();
    expect(cart.items).toHaveLength(0);
  });

  it("should remove an item from the cart", async () => {
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 1 });
    await userCaller.cart.removeItem({ productId: testProduct.id });
    const cart = await userCaller.cart.getCart();
    expect(cart.items).toHaveLength(0);
  });

  it("should clear all items from the cart", async () => {
    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 1 });
    const anotherProduct = await managerCaller.product.create({
      productName: "Test Jeans",
      productModel: "JeanModel-Y",
      productQuantityInStock: 50,
      productCategory: "Apparel",
      productPrice: 5000,
      productWarrantyStatus: false,
      productFrontImage: "/jean-front.jpg",
      productBackImage: "/jean-back.jpg",
    });
    await userCaller.cart.addItem({ productId: anotherProduct.id, quantity: 1 });

    await userCaller.cart.clearCart();
    const cart = await userCaller.cart.getCart();
    expect(cart.items).toHaveLength(0);
  });

  it("should get the correct item count", async () => {
    let count = await userCaller.cart.getItemCount();
    expect(count).toBe(0);

    await userCaller.cart.addItem({ productId: testProduct.id, quantity: 3 });
    count = await userCaller.cart.getItemCount();
    expect(count).toBe(3);
  });
});
