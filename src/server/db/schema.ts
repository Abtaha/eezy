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

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
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
      .$onUpdate(() => /* @__PURE__ */ new Date())
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
      .$onUpdate(() => /* @__PURE__ */ new Date())
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
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const product = pgTable("product", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull(),
  frontImage: text("front_image").notNull(),
  backImage: text("back_image").notNull(),
  serialNumber: serial("serial_number").notNull().unique(),
  distributor: text("distributor"),
  description: text("description"),
  quantityInStock: integer("quantity_in_stock").default(0).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  warrantyStatus: boolean("warranty_status").default(false).notNull(),
  distributor: text("distributor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
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

<<<<<<< HEAD
export const userRelations = relations(user, ({ one, many }) => ({
  cart: one(cart),
  comments: many(comments),
  ratings: many(ratings),
  managedRefunds: many(refunds),
}));

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userID],
    references: [user.id],
  }),
  items: many(cartItem),
}));

export const productRelations = relations(product, ({ many }) => ({
  cartItems: many(cartItem),
  comments: many(comments),
  ratings: many(ratings),
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

=======
>>>>>>> main
// status for order
export const orderStatusEnum = pgEnum("order_status", [
  "processing",
  "in_transit",
  "delivered",
]);

// status for refund
export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "approved",
  "rejected",
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
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

<<<<<<< HEAD
export const orderItemRelations = relations(orderItems, ({ one, many }) => ({
=======
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
  fileUrl: text("file_url"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(user, ({ one, many }) => ({
  cart: one(cart),
  orders: many(orders),
  comments: many(comments),
  ratings: many(ratings),
  sessions: many(session),
  accounts: many(account),
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

export const productRelations = relations(product, ({ many }) => ({
  cartItems: many(cartItem),
  orderItems: many(orderItems),
  comments: many(comments),
  ratings: many(ratings),
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

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
>>>>>>> main
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

// relations for commets
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

<<<<<<< HEAD
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
=======
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
export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

>>>>>>> main
