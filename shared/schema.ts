import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ USERS ============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull().default(""),
  email: text("email").default(""),
  phone: text("phone").default(""),
  password: text("password").notNull(),
  bio: text("bio").default(""),
  location: text("location").default(""),
  avatar: text("avatar").default(""),
  profileImageUrl: text("profile_image_url").default(""),
  banner: text("banner").default(""),
  website: text("website").default(""),
  profession: text("profession").default(""),
  isPrivate: boolean("is_private").default(false),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  postCount: integer("post_count").default(0),
  firebaseUid: text("firebase_uid"), // Firebase UID for auth mapping (optional)
  fcmToken: text("fcm_token"), // Firebase Cloud Messaging token for push notifications
  status: text("status").default("active"), // "active" | "suspended" | "banned" | "disabled"
  suspensionReason: text("suspension_reason").default(""),
  bannedReason: text("banned_reason").default(""),
  disabledReason: text("disabled_reason").default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firebaseUid: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  location: true,
  avatar: true,
  profileImageUrl: true,
  banner: true,
  website: true,
  profession: true,
  email: true,
  phone: true,
  password: true,
  isPrivate: true,
}).partial(); // Make all fields optional for profile updates

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

// ============ POSTS ============
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  image: text("image").notNull(),
  images: text("images").array().default(sql`'{}'`), // Multiple images support
  caption: text("caption").default(""),
  category: text("category").notNull(), // "Fashion", "Music", "Art", "Culture", "Lifestyle"
  hashtags: text("hashtags").default(""), // Hashtags as comma-separated string
  likes: integer("likes").default(0),
  commentCount: integer("comment_count").default(0),
  engagementScore: integer("engagement_score").default(0), // likes * 1 + comments * 2 + saves * 3
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

// ============ USER SETTINGS ============
export const userSettings = pgTable("user_settings", {
  userId: varchar("user_id").primaryKey(),
  privateAccount: boolean("private_account").default(false),
  allowComments: boolean("allow_comments").default(true),
  allowMentions: boolean("allow_mentions").default(true),
  notificationsLikes: boolean("notifications_likes").default(true),
  notificationsComments: boolean("notifications_comments").default(true),
  notificationsFollows: boolean("notifications_follows").default(true),
  notificationsTrending: boolean("notifications_trending").default(true),
  notificationsPush: boolean("notifications_push").default(true),
  notificationsEmail: boolean("notifications_email").default(true),
  privacyActivityStatus: boolean("privacy_activity_status").default(true),
  contentHideExplicit: boolean("content_hide_explicit").default(false),
  contentMutedWords: boolean("content_muted_words").default(false),
  contentRestrictedMode: boolean("content_restricted_mode").default(false),
  displayDarkMode: boolean("display_dark_mode").default(true),
  displayTextSize: text("display_text_size").default("normal"),
  displayLanguage: text("display_language").default("en"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserSettings = typeof userSettings.$inferSelect;

// ============ BLOCKED USERS ============
export const blockedUsers = pgTable("blocked_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  blockedUserId: varchar("blocked_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BlockedUser = typeof blockedUsers.$inferSelect;

// ============ USER REPORTS ============
export const userReports = pgTable("user_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reportType: text("report_type").notNull(), // "spam", "abuse", "inappropriate", "other"
  description: text("description").notNull(),
  postId: varchar("post_id"), // Optional: for post-specific reports
  reportedUserId: varchar("reported_user_id"), // Optional: for user-specific reports
  status: text("status").default("pending"), // "pending", "reviewed", "resolved"
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserReport = typeof userReports.$inferSelect;

// ============ BADGES ============
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconSvg: text("icon_svg").notNull(), // Stored as SVG string
  color: text("color").notNull(), // CSS color value
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// ============ USER BADGES ============
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  badgeId: varchar("badge_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserBadge = typeof userBadges.$inferSelect;

// ============ FOLLOW REQUESTS ============
export const followRequests = pgTable("follow_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull(),
  followingId: varchar("following_id").notNull(),
  status: text("status").default("pending"), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow(),
});

export type FollowRequest = typeof followRequests.$inferSelect;

// ============ HASHTAGS ============
export const hashtags = pgTable("hashtags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tag: text("tag").notNull().unique(),
  usageCount: integer("usage_count").default(0),
  trendingRank: integer("trending_rank"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Hashtag = typeof hashtags.$inferSelect;

// ============ HASHTAG FOLLOWS ============
export const hashtagFollows = pgTable("hashtag_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  hashtagId: varchar("hashtag_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type HashtagFollow = typeof hashtagFollows.$inferSelect;

// ============ SAVED POSTS ============
export const saves = pgTable("saves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postId: varchar("post_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Save = typeof saves.$inferSelect;

// ============ STORIES ============
export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  image: text("image").notNull(), // Base64 image
  caption: text("caption").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours from creation
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
});

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

// ============ STORY VIEWS ============
export const storyViews = pgTable("story_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").notNull(),
  viewerId: varchar("viewer_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export type StoryView = typeof storyViews.$inferSelect;

// ============ ADMIN PERMISSIONS ============
export const adminPermissions = pgTable("admin_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull(),
  permission: text("permission").notNull(), // "ban_user", "suspend_user", etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminPermission = typeof adminPermissions.$inferSelect;

// ============ ADMINS ============
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  role: text("role").notNull(), // "owner", "super_admin", "moderator"
  createdAt: timestamp("created_at").defaultNow(),
});

export type Admin = typeof admins.$inferSelect;

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
