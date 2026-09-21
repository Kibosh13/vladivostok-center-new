import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentItems = sqliteTable(
  "content_items",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    body: text("body").notNull().default(""),
    image: text("image").notNull().default(""),
    meta: text("meta").notNull().default("{}"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_content_items_type_sort").on(table.type, table.sortOrder)],
);

export const leads = sqliteTable(
  "leads",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    message: text("message").notNull().default(""),
    source: text("source").notNull().default("site"),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_leads_status_created").on(table.status, table.createdAt)],
);
