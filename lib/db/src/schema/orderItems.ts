import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productSlug: text("product_slug").notNull(),
  brand: text("brand").notNull(),
  sizeMl: integer("size_ml").notNull(),
  imageUrl: text("image_url").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export type OrderItem = typeof orderItemsTable.$inferSelect;
