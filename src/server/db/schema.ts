import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  serial,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "salesManager",
  "supportAgent",
  "productManager",
]);

function generateTaxID() {
  return `TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
}

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  taxID: text("tax_id")
    .notNull()
    .unique()
    .$defaultFn(() => generateTaxID()),
  role: userRoleEnum("role").default("user").notNull(),
  homeAddress: text("home_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
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
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const product = pgTable("product", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),

  categoryId: uuid("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "restrict" }),

  frontImage: text("front_image").notNull(),
  backImage: text("back_image").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  serialNumber: serial("serial_number").notNull().unique(),
  distributor: text("distributor"),
  description: text("description"),
  quantityInStock: integer("quantity_in_stock").default(0).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: integer("discount_percentage").default(0).notNull(),
  warrantyStatus: boolean("warranty_status").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userID: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cartItem = pgTable("cart_item", {
  id: serial("id").primaryKey(),
  cartID: integer("cart_id")
    .notNull()
    .references(() => cart.id, { onDelete: "cascade" }),
  productID: uuid("product_id")
    .notNull()
    .references(() => product.id),
  quantity: integer("quantity").default(1).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ratings table
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // Rating out of 5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// status for order
export const orderStatusEnum = pgEnum("order_status", [
  "processing",
  "in_transit",
  "delivered",
  "cancelled",
]);

// order table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),

  shippingAddress: text("shipping_address"),
  paymentMethod: text("payment_method"),
  trackingNumber: text("tracking_number"),
});

// items table
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),

  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: numeric("discount_percent", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// conversation status
export const conversationStatusEnum = pgEnum("conversation_status", [
  "open",
  "closed",
  "archived",
]);

// conversation table
export const conversation = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  sessionId: text("session_id").references(() => session.id, {
    onDelete: "set null",
  }),
  agentId: text("agent_id").references(() => user.id, { onDelete: "set null" }),
  status: conversationStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// sender status
export const senderTypeEnum = pgEnum("sender_type", ["user", "agent"]);

// message table
export const message = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  senderType: senderTypeEnum("sender_type").notNull(),
  content: text("content"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),

  // Link the file to a specific message
  messageId: uuid("message_id")
    .references(() => message.id, { onDelete: "cascade" }) // If message deletes, files delete
    .notNull(),

  url: text("url").notNull(), // S3 or Uploadthing URL
  name: text("name"),
  type: text("type"),
  size: integer("size"), // File size in bytes (optional, useful for UI)

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// status for refund
// UPDATED: Added "refunded" here to match your later definition
export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "approved",
  "rejected",
  "refunded",
]);

// refunds table
export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  managerId: text("manager_id").references(() => user.id, {
    onDelete: "set null",
  }),
  requestDate: timestamp("request_date").defaultNow().notNull(),
  status: refundStatusEnum("status").notNull(),
  refundAmount: numeric("refund_amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const wishlistItem = pgTable(
  "wishlist_item",
  {
    id: serial("id").primaryKey(),
    wishlistId: integer("wishlist_id")
      .notNull()
      .references(() => wishlist.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [
    index("wishlist_item_wishlist_idx").on(table.wishlistId),
    index("wishlist_item_product_idx").on(table.productId),
  ],
);

// RELATIONS ------------------------------------------------------------------

export const userRelations = relations(user, ({ one, many }) => ({
  cart: one(cart, {
    fields: [user.id],
    references: [cart.userID],
  }),
  orders: many(orders),
  comments: many(comments),
  ratings: many(ratings),
  sessions: many(session),
  accounts: many(account),
  wishlists: one(wishlist),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userID],
    references: [user.id],
  }),
  items: many(cartItem),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  cartItems: many(cartItem),
  orderItems: many(orderItems),
  comments: many(comments),
  ratings: many(ratings),
  wishlistItems: many(wishlistItem),
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
}));

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

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(product, {
    fields: [orderItems.productId],
    references: [product.id],
  }),
  refunds: many(refunds),
}));

// relations for comments
export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [comments.productId],
    references: [product.id],
  }),
}));

// relation for ratings
export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(user, {
    fields: [ratings.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [ratings.productId],
    references: [product.id],
  }),
}));

// Refunds relations
export const refundsRelations = relations(refunds, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [refunds.orderItemId],
    references: [orderItems.id],
  }),
  manager: one(user, {
    fields: [refunds.managerId],
    references: [user.id],
  }),
}));

// relations for conversation
export const conversationRelations = relations(
  conversation,
  ({ one, many }) => ({
    user: one(user, {
      fields: [conversation.userId],
      references: [user.id],
    }),
    agent: one(user, {
      fields: [conversation.agentId],
      references: [user.id],
    }),
    session: one(session, {
      fields: [conversation.sessionId],
      references: [session.id],
    }),
    messages: many(message),
  }),
);

// relations for message
export const messageRelations = relations(message, ({ one, many }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  attachments: many(attachments),
}));

// An attachment belongs to ONE message
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(message, {
    fields: [attachments.messageId],
    references: [message.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ one, many }) => ({
  user: one(user, {
    fields: [wishlist.userId],
    references: [user.id],
  }),
  items: many(wishlistItem),
}));

export const wishlistItemRelations = relations(wishlistItem, ({ one }) => ({
  wishlist: one(wishlist, {
    fields: [wishlistItem.wishlistId],
    references: [wishlist.id],
  }),
  product: one(product, {
    fields: [wishlistItem.productId],
    references: [product.id],
  }),
}));
