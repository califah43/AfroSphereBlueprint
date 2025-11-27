import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ USERS ============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull().default(""),
  password: text("password").notNull(),
  bio: text("bio").default(""),
  location: text("location").default(""),
  avatar: text("avatar").default(""),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  postCount: integer("post_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  location: true,
  avatar: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

// ============ POSTS ============
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  image: text("image").notNull(),
  caption: text("caption").default(""),
  category: text("category").notNull(), // "Fashion", "Music", "Art", "Culture", "Lifestyle"
  likes: integer("likes").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likes: true,
  commentCount: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// ============ COMMENTS ============
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  likes: integer("likes").default(0),
  replyTo: varchar("reply_to"), // Parent comment ID for threading
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// ============ LIKES ============
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postId: varchar("post_id"),
  commentId: varchar("comment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Like = typeof likes.$inferSelect;

// ============ FOLLOWS ============
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull(),
  followingId: varchar("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Follow = typeof follows.$inferSelect;

// ============ CREATOR BADGES ============
export const creatorBadges = pgTable("creator_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  badges: jsonb("badges").default(sql`'[]'`), // Array of badge types
  tier: text("tier").default("bronze"), // bronze, silver, gold, platinum
  createdAt: timestamp("created_at").defaultNow(),
});

export type CreatorBadge = typeof creatorBadges.$inferSelect;

// ============ NOTIFICATIONS ============
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "like", "comment", "follow", "badge"
  fromUserId: varchar("from_user_id"),
  postId: varchar("post_id"),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
