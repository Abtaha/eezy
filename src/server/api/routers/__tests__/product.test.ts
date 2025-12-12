/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from "vitest";
import { clearDatabase } from "@/server/test-utils/db";
import { createTestCaller } from "@/server/test-utils/trpc";
import type { User } from "@/server/auth";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

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

describe("Product Router", () => {
  let managerCaller: ReturnType<typeof createTestCaller>;
  let userCaller: ReturnType<typeof createTestCaller>;
  let publicCaller: ReturnType<typeof createTestCaller>;
  let mockManager: User;

  beforeEach(async () => {
    await clearDatabase();

    // Create fresh mocks for each test
    mockManager = createMockUser("productManager", "test-product-manager@example.com");
    const mockUser = createMockUser("user", "test-product-user@example.com");

    // Create a session object without a strict type, and cast it to any to bypass type-checking
    const managerSession = {
      user: mockManager,
    };

    const userSession = {
      user: mockUser,
    };

    // Create fresh callers for each test
    managerCaller = createTestCaller({ session: managerSession as any });
    userCaller = createTestCaller({ session: userSession as any });
    publicCaller = createTestCaller();

    // Create users in the database so foreign key constraints are met
    await db.insert(user).values([mockUser, mockManager]).returning();
  });

  const productInput = {
    productName: "Test T-Shirt",
    productModel: "CoolModel-X",
    productDescription: "A very cool t-shirt for testing.",
    productQuantityInStock: 100,
    productCategory: "Apparel",
    productPrice: 2500, // in cents
    productWarrantyStatus: true,
    productFrontImage: "/test-front.jpg",
    productBackImage: "/test-back.jpg",
    productDistributor: "Test Distributor",
  };

  it("should create a new product", async () => {
    const newProduct = await managerCaller.product.create(productInput);

    expect(newProduct).toBeDefined();
    expect(newProduct.name).toBe(productInput.productName);
    expect(newProduct.quantityInStock).toBe(productInput.productQuantityInStock);

    // Verify it was written to the DB
    const fetchedProduct = await publicCaller.product.get({ id: newProduct.id });
    expect(fetchedProduct).toEqual(expect.objectContaining(newProduct));
  });

  it("should prevent a regular user from creating a product", async () => {
    await expect(userCaller.product.create(productInput)).rejects.toThrow(
      new TRPCError({ code: "UNAUTHORIZED" })
    );
  });

  it("should get a single product by ID", async () => {
    const newProduct = await managerCaller.product.create(productInput);
    const fetchedProduct = await publicCaller.product.get({ id: newProduct.id });

    expect(fetchedProduct).toEqual(expect.objectContaining(newProduct));
  });

  it("should throw an error if a product is not found", async () => {
    const nonExistentId = randomUUID();
    await expect(publicCaller.product.get({ id: nonExistentId })).rejects.toThrow(
      "Product not found"
    );
  });

  it("should get all products", async () => {
    // Initially, should be empty
    let allProducts = await publicCaller.product.getAll();
    expect(allProducts).toHaveLength(0);

    // Create two products
    await managerCaller.product.create(productInput);
    await managerCaller.product.create({ ...productInput, productName: "Another Shirt" });

    allProducts = await publicCaller.product.getAll();
    expect(allProducts).toHaveLength(2);
  });

  it("should delete a product", async () => {
    const newProduct = await managerCaller.product.create(productInput);

    // Delete the product
    await managerCaller.product.delete({
      productid: newProduct.id,
      userid: mockManager.id,
    });

    // Verify it's gone
    await expect(publicCaller.product.get({ id: newProduct.id })).rejects.toThrow(
      "Product not found"
    );
  });

  it("should search for products by name and description", async () => {
    await managerCaller.product.create(productInput);
    await managerCaller.product.create({
      ...productInput,
      productName: "Awesome Jacket",
      productDescription: "A very awesome jacket for winter.",
    });

    // Search by name
    let searchResults = await publicCaller.product.search({ querystring: "T-Shirt" });
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe("Test T-Shirt");

    // Search by description
    searchResults = await publicCaller.product.search({ querystring: "jacket" });
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe("Awesome Jacket");
  });

  it("should get related products", async () => {
    const p1 = await managerCaller.product.create({ ...productInput, productCategory: "Apparel" });
    const p2 = await managerCaller.product.create({ ...productInput, productName: "Pants", productCategory: "Apparel" });
    await managerCaller.product.create({ ...productInput, productName: "Hat", productCategory: "Accessories" });

    const related = await publicCaller.product.getRelated({
      id: p1.id,
      category: "Apparel",
      limit: 5,
    });

    expect(related).toHaveLength(1);
    expect(related.map(p => p.name)).toContain(p2.name);
  });
});
