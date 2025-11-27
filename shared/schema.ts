import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(), // Unique identifier (immutable) e.g. @adikeafrica
  displayName: text("display_name").notNull().default(""), // Public name (editable) e.g. "Adike Wilson"
  password: text("password").notNull(),
  bio: text("bio").default(""),
  location: text("location").default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  location: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
