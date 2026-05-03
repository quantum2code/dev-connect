import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { authors } from "./authors";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  media: jsonb("media").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  views: integer("views").notNull().default(0),
  reposts: integer("reposts").notNull().default(0),
  reactions: integer("reactions").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
