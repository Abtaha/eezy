import { db } from "@/server/db";
import { sql } from "drizzle-orm";

/**
 * Clears the database by truncating all tables.
 */
export const clearDatabase = async () => {
  const query = sql.raw(`
    TRUNCATE TABLE 
      "user", 
      "session", 
      "account", 
      "verification", 
      "product", 
      "cart", 
      "cart_item", 
      "comments", 
      "ratings", 
      "orders", 
      "order_items"
    RESTART IDENTITY CASCADE;
  `);
  await db.execute(query);
};
