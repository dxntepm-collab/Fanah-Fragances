import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { brandsTable } from "./brands";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id")
    .notNull()
    .references(() => brandsTable.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  family: text("family").notNull(),
  description: text("description").notNull(),
  topNotes: text("top_notes").array().notNull().default([]),
  heartNotes: text("heart_notes").array().notNull().default([]),
  baseNotes: text("base_notes").array().notNull().default([]),
  longevity: text("longevity"),
  sillage: text("sillage"),
  imageUrl: text("image_url").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  popularity: integer("popularity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
