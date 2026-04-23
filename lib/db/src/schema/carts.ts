import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const cartsTable = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Cart = typeof cartsTable.$inferSelect;
