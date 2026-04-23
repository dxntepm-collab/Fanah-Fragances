import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { productsTable } from "./products";

export const variantsTable = pgTable("decant_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  sizeMl: integer("size_ml").notNull(),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(50),
});

export type Variant = typeof variantsTable.$inferSelect;
