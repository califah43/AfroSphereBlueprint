import { users, posts, comments, likes, follows, creatorBadges, notifications, userSettings, badges, userBadges, hashtags, hashtagFollows, saves, blockedUsers, userReports, followRequests, admins, adminPermissions, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Like, type Follow, type CreatorBadge, type Notification, type UserSettings, type Badge, type UserBadge, type InsertBadge, type Admin, type InsertAdmin, type AdminPermission, type BlockedUser, type UserReport, type FollowRequest, type Hashtag, type HashtagFollow } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, ilike } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: any): Promise<User | undefined>;
  suspendUser(userId: string, reason: string): Promise<User | undefined>;
  banUser(userId: string, reason: string): Promise<User | undefined>;
  disableUser(userId: string, reason: string): Promise<User | undefined>;
  restoreUser(userId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Posts
  getPost(id: string): Promise<Post | undefined>;
  listPosts(limit?: number, offset?: number): Promise<Post[]>;
  listPostsByUser(userId: string): Promise<Post[]>;
  listPostsByCategory(category: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;
  getUserLikedPosts(userId: string): Promise<Post[]>;
  getPostsByGenre(genre: string): Promise<Post[]>;
  
  // Comments
  getComment(id: string): Promise<Comment | undefined>;
  listComments(postId: string): Promise<Comment[]>;
  getCommentReplies(commentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  
  // Likes
  likePost(userId: string, postId: string): Promise<Like>;
  unlikePost(userId: string, postId: string): Promise<void>;
  hasUserLikedPost(userId: string, postId: string): Promise<boolean>;
  likeComment(userId: string, commentId: string): Promise<Like>;
  unlikeComment(userId: string, commentId: string): Promise<void>;
  hasUserLikedComment(userId: string, commentId: string): Promise<boolean>;
  
  // Follows
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Notifications
  createNotification(notification: any): Promise<Notification>;
  listNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
  saveFCMToken(userId: string, token: string): Promise<void>;
  getFCMToken(userId: string): Promise<string | undefined>;

  // Badges
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  deleteBadge(badgeId: string): Promise<void>;
  getUserBadges(userId: string): Promise<Badge[]>;
  assignBadge(userId: string, badgeId: string): Promise<UserBadge>;
  removeBadge(userId: string, badgeId: string): Promise<void>;

  // Saved Posts
  savePost(userId: string, postId: string): Promise<void>;
  unsavePost(userId: string, postId: string): Promise<void>;
  isSavedPost(userId: string, postId: string): Promise<boolean>;
  getSavedPosts(userId: string): Promise<Post[]>;

  // Hashtags
  getHashtag(name: string): Promise<Hashtag | undefined>;
  getAllHashtags(): Promise<Hashtag[]>;
  isFollowingHashtag(userId: string, hashtag: string): Promise<boolean>;
  followHashtag(userId: string, hashtag: string): Promise<void>;
  unfollowHashtag(userId: string, hashtag: string): Promise<void>;
  getFollowedHashtags(userId: string): Promise<string[]>;

  // Block & Report
  blockUser(userId: string, blockedUserId: string): Promise<BlockedUser>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  getBlockedUsers(userId: string): Promise<BlockedUser[]>;
  isBlocked(userId: string, blockedUserId: string): Promise<boolean>;
  createReport(report: Partial<UserReport>): Promise<UserReport>;
  submitReport(report: Partial<UserReport>): Promise<UserReport>;
  getReports(): Promise<UserReport[]>;
  getAllReports(): Promise<UserReport[]>;

  // Bulk getters
  getAllPosts(): Promise<Post[]>;
  getAllFollows(): Promise<Follow[]>;
  getAllComments(): Promise<Comment[]>;
  getAllLikes(): Promise<Like[]>;
  getAllNotifications(): Promise<Notification[]>;
  getAllHashtagFollows(): Promise<HashtagFollow[]>;
  getAllBadgesWithUsers(): Promise<any[]>;
  getBadgeUsers(badgeId: string): Promise<User[]>;

  // Search
  searchUsers(query: string, limit: number): Promise<User[]>;
  searchHashtags(query: string, limit: number): Promise<Hashtag[]>;
  searchPosts(query: string, limit: number): Promise<Post[]>;

  // Follow Requests
  hasFollowRequest(followerId: string, followingId: string): Promise<boolean>;
  createFollowRequest(followerId: string, followingId: string): Promise<FollowRequest>;
  getFollowRequests(userId: string): Promise<FollowRequest[]>;
  acceptFollowRequest(requestId: string): Promise<FollowRequest | undefined>;
  declineFollowRequest(requestId: string): Promise<FollowRequest | undefined>;

  // User management
  deleteUser(userId: string): Promise<void>;

  // Admin
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  verifyAdminPermission(userId: string, permission: string): Promise<boolean>;
  getAdminPermissions(userId: string): Promise<AdminPermission[]>;
  removeAdmin(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ============ USERS ============
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: any): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async suspendUser(userId: string, reason: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ status: "suspended", suspensionReason: reason }).where(eq(users.id, userId)).returning();
    return user;
  }

  async banUser(userId: string, reason: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ status: "banned", bannedReason: reason }).where(eq(users.id, userId)).returning();
    return user;
  }

  async disableUser(userId: string, reason: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ status: "disabled", disabledReason: reason }).where(eq(users.id, userId)).returning();
    return user;
  }

  async restoreUser(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ status: "active", suspensionReason: "", bannedReason: "", disabledReason: "" }).where(eq(users.id, userId)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // ============ POSTS ============
  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async listPosts(limit = 20, offset = 0): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
  }

  async listPostsByUser(userId: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async listPostsByCategory(category: string, limit = 20): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.category, category)).orderBy(desc(posts.createdAt)).limit(limit);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    await db.update(users).set({ postCount: sql`${users.postCount} + 1` }).where(eq(users.id, post.userId));
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const [updated] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.getPost(id);
    if (post) {
      await db.delete(posts).where(eq(posts.id, id));
      await db.update(users).set({ postCount: sql`GREATEST(0, ${users.postCount} - 1)` }).where(eq(users.id, post.userId));
    }
  }

  async getUserLikedPosts(userId: string): Promise<Post[]> {
    const userLikes = await db.select().from(likes).where(and(eq(likes.userId, userId), sql`${likes.postId} IS NOT NULL`));
    const postIds = userLikes.map((l: any) => l.postId!);
    if (postIds.length === 0) return [];
    return db.select().from(posts).where(sql`${posts.id} IN (${sql.join(postIds.map((id: any) => sql`${id}`), sql`, `)})`).orderBy(desc(posts.createdAt));
  }

  async getPostsByGenre(genre: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(sql`LOWER(${posts.category})`, genre.toLowerCase())).orderBy(desc(posts.createdAt));
  }

  // ============ COMMENTS ============
  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async listComments(postId: string): Promise<Comment[]> {
    return db.select().from(comments).where(and(eq(comments.postId, postId), sql`${comments.replyTo} IS NULL`)).orderBy(desc(comments.createdAt));
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.replyTo, commentId)).orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    await db.update(posts).set({ commentCount: sql`${posts.commentCount} + 1` }).where(eq(posts.id, comment.postId));
    return newComment;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.getComment(id);
    if (comment) {
      await db.delete(comments).where(eq(comments.id, id));
      await db.update(posts).set({ commentCount: sql`GREATEST(0, ${posts.commentCount} - 1)` }).where(eq(posts.id, comment.postId));
    }
  }

  // ============ LIKES ============
  async likePost(userId: string, postId: string): Promise<Like> {
    const [existing] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    if (existing) return existing;
    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    await db.update(posts).set({ likes: sql`${posts.likes} + 1` }).where(eq(posts.id, postId));
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    if (like) {
      await db.delete(likes).where(eq(likes.id, like.id));
      await db.update(posts).set({ likes: sql`GREATEST(0, ${posts.likes} - 1)` }).where(eq(posts.id, postId));
    }
  }

  async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  async likeComment(userId: string, commentId: string): Promise<Like> {
    const [existing] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.commentId, commentId)));
    if (existing) return existing;
    const [like] = await db.insert(likes).values({ userId, commentId }).returning();
    await db.update(comments).set({ likes: sql`${comments.likes} + 1` }).where(eq(comments.id, commentId));
    return like;
  }

  async unlikeComment(userId: string, commentId: string): Promise<void> {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.commentId, commentId)));
    if (like) {
      await db.delete(likes).where(eq(likes.id, like.id));
      await db.update(comments).set({ likes: sql`GREATEST(0, ${comments.likes} - 1)` }).where(eq(comments.id, commentId));
    }
  }

  async hasUserLikedComment(userId: string, commentId: string): Promise<boolean> {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.commentId, commentId)));
    return !!like;
  }

  // ============ FOLLOWS ============
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [existing] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    if (existing) return existing;
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, followerId));
    await db.update(users).set({ followerCount: sql`${users.followerCount} + 1` }).where(eq(users.id, followingId));
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const [follow] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    if (follow) {
      await db.delete(follows).where(eq(follows.id, follow.id));
      await db.update(users).set({ followingCount: sql`GREATEST(0, ${users.followingCount} - 1)` }).where(eq(users.id, followerId));
      await db.update(users).set({ followerCount: sql`GREATEST(0, ${users.followerCount} - 1)` }).where(eq(users.id, followingId));
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followList = await db.select().from(follows).where(eq(follows.followingId, userId));
    const ids = followList.map((f: any) => f.followerId);
    if (ids.length === 0) return [];
    return db.select().from(users).where(sql`${users.id} IN (${sql.join(ids.map((id: any) => sql`${id}`), sql`, `)})`);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followList = await db.select().from(follows).where(eq(follows.followerId, userId));
    const ids = followList.map((f: any) => f.followingId);
    if (ids.length === 0) return [];
    return db.select().from(users).where(sql`${users.id} IN (${sql.join(ids.map((id: any) => sql`${id}`), sql`, `)})`);
  }

  // ============ NOTIFICATIONS ============
  async createNotification(notification: any): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async listNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  // ============ SETTINGS ============
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async saveUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    if (existing) {
      const [updated] = await db.update(userSettings).set({ ...updates, updatedAt: new Date() }).where(eq(userSettings.userId, userId)).returning();
      if (updates.privateAccount !== undefined) {
        await db.update(users).set({ isPrivate: updates.privateAccount }).where(eq(users.id, userId));
      }
      return updated;
    } else {
      const [inserted] = await db.insert(userSettings).values({ ...updates, userId } as any).returning();
      return inserted;
    }
  }

  async saveFCMToken(userId: string, token: string): Promise<void> {
    await db.update(users).set({ fcmToken: token }).where(eq(users.id, userId));
  }

  async getFCMToken(userId: string): Promise<string | undefined> {
    const user = await this.getUser(userId);
    return user?.fcmToken || undefined;
  }

  // ============ BADGES ============
  async getBadges(): Promise<Badge[]> {
    return db.select().from(badges);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  async deleteBadge(badgeId: string): Promise<void> {
    await db.delete(badges).where(eq(badges.id, badgeId));
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const uBadges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
    const ids = uBadges.map((ub: any) => ub.badgeId);
    if (ids.length === 0) return [];
    return db.select().from(badges).where(sql`${badges.id} IN (${sql.join(ids.map((id: any) => sql`${id}`), sql`, `)})`);
  }

  async assignBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [ub] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return ub;
  }

  async removeBadge(userId: string, badgeId: string): Promise<void> {
    await db.delete(userBadges).where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  }

  // ============ SAVED POSTS ============
  async savePost(userId: string, postId: string): Promise<void> {
    const [existing] = await db.select().from(saves).where(and(eq(saves.userId, userId), eq(saves.postId, postId)));
    if (!existing) {
      await db.insert(saves).values({ userId, postId });
    }
  }

  async unsavePost(userId: string, postId: string): Promise<void> {
    await db.delete(saves).where(and(eq(saves.userId, userId), eq(saves.postId, postId)));
  }

  async isSavedPost(userId: string, postId: string): Promise<boolean> {
    const [save] = await db.select().from(saves).where(and(eq(saves.userId, userId), eq(saves.postId, postId)));
    return !!save;
  }

  async getSavedPosts(userId: string): Promise<Post[]> {
    const userSaves = await db.select().from(saves).where(eq(saves.userId, userId));
    const ids = userSaves.map((s: any) => s.postId);
    if (ids.length === 0) return [];
    return db.select().from(posts).where(sql`${posts.id} IN (${sql.join(ids.map((id: any) => sql`${id}`), sql`, `)})`).orderBy(desc(posts.createdAt));
  }

  // ============ HASHTAGS ============
  async getHashtag(name: string): Promise<Hashtag | undefined> {
    const [tag] = await db.select().from(hashtags).where(eq(sql`LOWER(${hashtags.tag})`, name.toLowerCase()));
    return tag;
  }

  async getAllHashtags(): Promise<Hashtag[]> {
    return db.select().from(hashtags);
  }

  async isFollowingHashtag(userId: string, hashtag: string): Promise<boolean> {
    const [follow] = await db.select().from(hashtagFollows).where(and(eq(hashtagFollows.userId, userId), eq(hashtagFollows.hashtagId, hashtag)));
    return !!follow;
  }

  async followHashtag(userId: string, hashtag: string): Promise<void> {
    const [existing] = await db.select().from(hashtagFollows).where(and(eq(hashtagFollows.userId, userId), eq(hashtagFollows.hashtagId, hashtag)));
    if (!existing) {
      await db.insert(hashtagFollows).values({ userId, hashtagId: hashtag });
    }
  }

  async unfollowHashtag(userId: string, hashtag: string): Promise<void> {
    await db.delete(hashtagFollows).where(and(eq(hashtagFollows.userId, userId), eq(hashtagFollows.hashtagId, hashtag)));
  }

  async getFollowedHashtags(userId: string): Promise<string[]> {
    const list = await db.select().from(hashtagFollows).where(eq(hashtagFollows.userId, userId));
    return list.map((f: any) => f.hashtagId);
  }

  // ============ BLOCKED USERS ============
  async blockUser(userId: string, blockedUserId: string): Promise<BlockedUser> {
    const [block] = await db.insert(blockedUsers).values({ userId, blockedUserId }).returning();
    return block;
  }

  async isBlocked(userId: string, blockedUserId: string): Promise<boolean> {
    const [block] = await db.select().from(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
    return !!block;
  }

  async createReport(report: Partial<UserReport>): Promise<UserReport> {
    const [newReport] = await db.insert(userReports).values(report as any).returning();
    return newReport;
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await db.delete(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    return db.select().from(blockedUsers).where(eq(blockedUsers.userId, userId));
  }

  async submitReport(report: Partial<UserReport>): Promise<UserReport> {
    return this.createReport(report);
  }

  async getReports(): Promise<UserReport[]> {
    return db.select().from(userReports).orderBy(desc(userReports.createdAt));
  }

  async getAllReports(): Promise<UserReport[]> {
    return this.getReports();
  }

  // ============ BULK GETTERS ============
  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getAllFollows(): Promise<Follow[]> {
    return db.select().from(follows);
  }

  async getAllComments(): Promise<Comment[]> {
    return db.select().from(comments);
  }

  async getAllLikes(): Promise<Like[]> {
    return db.select().from(likes);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return db.select().from(notifications);
  }

  async getAllHashtagFollows(): Promise<HashtagFollow[]> {
    return db.select().from(hashtagFollows);
  }

  async getAllBadgesWithUsers(): Promise<any[]> {
    const allBadges = await db.select().from(badges);
    const result = await Promise.all(allBadges.map(async (badge: Badge) => {
      const ubs = await db.select().from(userBadges).where(eq(userBadges.badgeId, badge.id));
      const badgeUsers = await Promise.all(ubs.map(async (ub: UserBadge) => {
        const [user] = await db.select().from(users).where(eq(users.id, ub.userId));
        return user;
      }));
      return { ...badge, users: badgeUsers.filter(Boolean) };
    }));
    return result;
  }

  async getBadgeUsers(badgeId: string): Promise<User[]> {
    const ubs = await db.select().from(userBadges).where(eq(userBadges.badgeId, badgeId));
    if (ubs.length === 0) return [];
    const ids = ubs.map((ub: any) => ub.userId);
    return db.select().from(users).where(sql`${users.id} IN (${sql.join(ids.map((id: any) => sql`${id}`), sql`, `)})`);
  }

  // ============ SEARCH ============
  async searchUsers(query: string, limit: number): Promise<User[]> {
    return db.select().from(users).where(
      or(
        ilike(users.username, `%${query}%`),
        ilike(users.displayName, `%${query}%`)
      )
    ).limit(limit);
  }

  async searchHashtags(query: string, limit: number): Promise<Hashtag[]> {
    return db.select().from(hashtags).where(
      ilike(hashtags.tag, `%${query}%`)
    ).limit(limit);
  }

  async searchPosts(query: string, limit: number): Promise<Post[]> {
    return db.select().from(posts).where(
      or(
        ilike(posts.caption, `%${query}%`),
        ilike(posts.hashtags, `%${query}%`)
      )
    ).limit(limit);
  }

  // ============ FOLLOW REQUESTS ============
  async hasFollowRequest(followerId: string, followingId: string): Promise<boolean> {
    const [req] = await db.select().from(followRequests).where(
      and(eq(followRequests.followerId, followerId), eq(followRequests.followingId, followingId), eq(followRequests.status, "pending"))
    );
    return !!req;
  }

  async createFollowRequest(followerId: string, followingId: string): Promise<FollowRequest> {
    const [req] = await db.insert(followRequests).values({ followerId, followingId }).returning();
    return req;
  }

  async getFollowRequests(userId: string): Promise<FollowRequest[]> {
    return db.select().from(followRequests).where(
      and(eq(followRequests.followingId, userId), eq(followRequests.status, "pending"))
    ).orderBy(desc(followRequests.createdAt));
  }

  async acceptFollowRequest(requestId: string): Promise<FollowRequest | undefined> {
    const [req] = await db.update(followRequests).set({ status: "accepted" }).where(eq(followRequests.id, requestId)).returning();
    if (req) {
      await this.followUser(req.followerId, req.followingId);
    }
    return req;
  }

  async declineFollowRequest(requestId: string): Promise<FollowRequest | undefined> {
    const [req] = await db.update(followRequests).set({ status: "declined" }).where(eq(followRequests.id, requestId)).returning();
    return req;
  }

  // ============ USER MANAGEMENT ============
  async deleteUser(userId: string): Promise<void> {
    await db.delete(comments).where(eq(comments.userId, userId));
    await db.delete(likes).where(eq(likes.userId, userId));
    await db.delete(follows).where(or(eq(follows.followerId, userId), eq(follows.followingId, userId)));
    await db.delete(notifications).where(or(eq(notifications.userId, userId), eq(notifications.fromUserId, userId)));
    await db.delete(saves).where(eq(saves.userId, userId));
    await db.delete(userBadges).where(eq(userBadges.userId, userId));
    await db.delete(hashtagFollows).where(eq(hashtagFollows.userId, userId));
    await db.delete(blockedUsers).where(or(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, userId)));
    await db.delete(userReports).where(or(eq(userReports.userId, userId), eq(userReports.reportedUserId, userId)));
    await db.delete(followRequests).where(or(eq(followRequests.followerId, userId), eq(followRequests.followingId, userId)));
    await db.delete(adminPermissions).where(eq(adminPermissions.adminId, userId));
    await db.delete(admins).where(eq(admins.userId, userId));
    await db.delete(userSettings).where(eq(userSettings.userId, userId));
    await db.delete(posts).where(eq(posts.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }

  // ============ ADMIN ============
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async verifyAdminPermission(userId: string, permission: string): Promise<boolean> {
    const [admin] = await db.select().from(admins).where(eq(admins.userId, userId));
    if (!admin) return false;
    if (admin.role === "owner" || admin.role === "super_admin") return true;
    const [perm] = await db.select().from(adminPermissions).where(
      and(eq(adminPermissions.adminId, admin.id), eq(adminPermissions.permission, permission))
    );
    return !!perm;
  }

  async getAdminPermissions(userId: string): Promise<AdminPermission[]> {
    const [admin] = await db.select().from(admins).where(eq(admins.userId, userId));
    if (!admin) return [];
    return db.select().from(adminPermissions).where(eq(adminPermissions.adminId, admin.id));
  }

  async removeAdmin(userId: string): Promise<void> {
    const [admin] = await db.select().from(admins).where(eq(admins.userId, userId));
    if (admin) {
      await db.delete(adminPermissions).where(eq(adminPermissions.adminId, admin.id));
      await db.delete(admins).where(eq(admins.id, admin.id));
    }
  }
}

export const storage = new DatabaseStorage();
