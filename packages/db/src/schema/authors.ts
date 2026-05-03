import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const authors = pgTable("authors", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
