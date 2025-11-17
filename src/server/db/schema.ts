import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  serial,
  numeric,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const product = pgTable("product", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  frontImage: text("front_image").notNull(),
  backImage: text("back_image").notNull(),
  serialNumber: serial("serial_number").notNull().unique(),
  description: text("description"),
  quantityInStock: integer("quantity_in_stock").default(0).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  warrantyStatus: boolean("warranty_status").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade"}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const cartItem = pgTable("cart_item", {
  id: serial("id").primaryKey(),
  cartID: integer("cart_id").notNull().references(() => cart.id, { onDelete:"cascade"}),
  productID: uuid("product_id").notNull().references(() => product.id),
  quantity: integer("quantity").default(1).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

/* User - Cart Relation
Drizzle uses many because the cart table holds the userID as foreign key,
but app will create only one active cart per user.
*/
export const userRelations = relations(user, ({ many }) => ({
  carts: many(cart),
}));

/* Product - CartItem Relation
Product can appear in many cart items
*/
export const productRelations = relations(product, ({ many }) => ({
  cartItems: many(cartItem),
}));

/* Cart - User - CartItem Relation
Each cart belongs to one user
Each cart can have multiple items
*/
export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userID],
    references: [user.id],
  }),
  items: many(cartItem),
}));

/* CartItem - Cart - Product Relation
Each item belongs to one cart
Each item references one product
*/
export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartID],
    references: [cart.id],
  }),
  product: one(product, {
    fields: [cartItem.productID],
    references: [product.id],
  }),
}));