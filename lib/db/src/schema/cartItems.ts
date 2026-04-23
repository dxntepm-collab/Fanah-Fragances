import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { cartsTable } from "./carts";
import { variantsTable } from "./variants";

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => cartsTable.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => variantsTable.id),
  quantity: integer("quantity").notNull().default(1),
});

export type CartItem = typeof cartItemsTable.$inferSelect;
