import { db } from './db';
import { users, posts, comments, likes, follows, creatorBadges, notifications, userSettings, blockedUsers, userReports, badges, userBadges } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Like, type Follow, type CreatorBadge, type Notification, type UserSettings, type BlockedUser, type UserReport, type Badge, type UserBadge, type InsertBadge } from '@shared/schema';
import { randomUUID } from 'crypto';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: any): Promise<User | undefined>;
  getPost(id: string): Promise<Post | undefined>;
  listPosts(limit?: number, offset?: number): Promise<Post[]>;
  listPostsByUser(userId: string): Promise<Post[]>;
  listPostsByCategory(category: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: string): Promise<void>;
  getComment(id: string): Promise<Comment | undefined>;
  listComments(postId: string): Promise<Comment[]>;
  getCommentReplies(commentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  likePost(userId: string, postId: string): Promise<Like>;
  unlikePost(userId: string, postId: string): Promise<void>;
  hasUserLikedPost(userId: string, postId: string): Promise<boolean>;
  likeComment(userId: string, commentId: string): Promise<Like>;
  unlikeComment(userId: string, commentId: string): Promise<void>;
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  deleteBadge(badgeId: string): Promise<void>;
  getUserBadges(userId: string): Promise<Badge[]>;
  getBadgeUsers(badgeId: string): Promise<User[]>;
  assignBadge(userId: string, badgeId: string): Promise<UserBadge>;
  removeBadge(userId: string, badgeId: string): Promise<void>;
  createNotification(notification: any): Promise<Notification>;
  listNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
  blockUser(userId: string, blockedUserId: string): Promise<BlockedUser>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  getBlockedUsers(userId: string): Promise<User[]>;
  submitReport(userId: string, reportType: string, description: string, postId?: string, reportedUserId?: string): Promise<UserReport>;
  getReports(): Promise<UserReport[]>;
  deleteUser(userId: string): Promise<void>;
  saveFCMToken(userId: string, token: string): Promise<void>;
  getFCMToken(userId: string): Promise<string | undefined>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({ where: eq(users.id, id) });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({ where: eq(users.username, username) });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      firebaseUid: insertUser.firebaseUid || null,
      id,
      displayName: '',
      bio: '',
      location: '',
      avatar: '',
      banner: '',
      website: '',
      profession: '',
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: any): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.query.posts.findFirst({ where: eq(posts.id, id) });
    return result;
  }

  async listPosts(limit = 20, offset = 0): Promise<Post[]> {
    // Order by createdAt descending so newest posts appear first
    return db.query.posts.findMany({ 
      limit, 
      offset,
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    });
  }

  async listPostsByUser(userId: string): Promise<Post[]> {
    return db.query.posts.findMany({ where: eq(posts.userId, userId) });
  }

  async listPostsByCategory(category: string, limit = 20): Promise<Post[]> {
    return db.query.posts.findMany({ where: eq(posts.category, category), limit });
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return db.query.comments.findFirst({ where: eq(comments.id, id) });
  }

  async listComments(postId: string): Promise<Comment[]> {
    return db.query.comments.findMany({ where: eq(comments.postId, postId) });
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    return db.query.comments.findMany({ where: eq(comments.replyTo, commentId) });
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Only increment post commentCount if this is a top-level comment (not a reply)
    if (!comment.replyTo) {
      const post = await db.query.posts.findFirst({ where: eq(posts.id, comment.postId) });
      if (post) {
        await db.update(posts).set({ commentCount: (post.commentCount || 0) + 1 }).where(eq(posts.id, comment.postId));
      }
    }
    
    return newComment;
  }

  async deleteComment(id: string): Promise<void> {
    // Get the comment to find which post it belongs to
    const comment = await db.query.comments.findFirst({ where: eq(comments.id, id) });
    if (comment) {
      // Decrement post comment count
      const post = await db.query.posts.findFirst({ where: eq(posts.id, comment.postId) });
      if (post) {
        await db.update(posts).set({ commentCount: Math.max(0, (post.commentCount || 0) - 1) }).where(eq(posts.id, comment.postId));
      }
    }
    await db.delete(comments).where(eq(comments.id, id));
  }

  async likePost(userId: string, postId: string): Promise<Like> {
    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    // Update post like count
    const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
    if (post) {
      await db.update(posts).set({ likes: (post.likes || 0) + 1 }).where(eq(posts.id, postId));
    }
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    // Update post like count
    const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
    if (post) {
      await db.update(posts).set({ likes: Math.max(0, (post.likes || 0) - 1) }).where(eq(posts.id, postId));
    }
  }

  async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
    const like = await db.query.likes.findFirst({ where: and(eq(likes.userId, userId), eq(likes.postId, postId)) });
    return !!like;
  }

  async likeComment(userId: string, commentId: string): Promise<Like> {
    const [like] = await db.insert(likes).values({ userId, commentId }).returning();
    // Update comment like count
    const comment = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
    if (comment) {
      await db.update(comments).set({ likes: (comment.likes || 0) + 1 }).where(eq(comments.id, commentId));
    }
    return like;
  }

  async unlikeComment(userId: string, commentId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.commentId, commentId)));
    // Update comment like count
    const comment = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
    if (comment) {
      await db.update(comments).set({ likes: Math.max(0, (comment.likes || 0) - 1) }).where(eq(comments.id, commentId));
    }
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await db.query.follows.findFirst({ where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)) });
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followRecords = await db.query.follows.findMany({ where: eq(follows.followingId, userId) });
    const followerIds = followRecords.map(f => f.followerId);
    if (followerIds.length === 0) return [];
    return db.query.users.findMany({ where: inArray(users.id, followerIds) });
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followRecords = await db.query.follows.findMany({ where: eq(follows.followerId, userId) });
    const followingIds = followRecords.map(f => f.followingId);
    if (followingIds.length === 0) return [];
    return db.query.users.findMany({ where: inArray(users.id, followingIds) });
  }

  async createNotification(notification: any): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(notification).returning();
    return notif;
  }

  async listNotifications(userId: string): Promise<Notification[]> {
    return db.query.notifications.findMany({ where: eq(notifications.userId, userId) });
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
  }

  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    let result = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
    if (result) {
      const [updated] = await db.update(userSettings).set(settings).where(eq(userSettings.userId, userId)).returning();
      return updated;
    }
    const [newSettings] = await db.insert(userSettings).values({ userId, ...settings }).returning();
    return newSettings;
  }

  async blockUser(userId: string, blockedUserId: string): Promise<BlockedUser> {
    const [blocked] = await db.insert(blockedUsers).values({ userId, blockedUserId }).returning();
    return blocked;
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await db.delete(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const blocked = await db.query.blockedUsers.findMany({ where: eq(blockedUsers.userId, userId) });
    const blockedUserIds = blocked.map(b => b.blockedUserId);
    if (blockedUserIds.length === 0) return [];
    return db.query.users.findMany({ where: inArray(users.id, blockedUserIds) });
  }

  async submitReport(userId: string, reportType: string, description: string, postId?: string, reportedUserId?: string): Promise<UserReport> {
    const [report] = await db.insert(userReports).values({ userId, reportType, description, postId, reportedUserId }).returning();
    return report;
  }

  async getReports(): Promise<UserReport[]> {
    return db.query.userReports.findMany({ orderBy: (t) => t.createdAt });
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete all user data
    await db.delete(posts).where(eq(posts.userId, userId));
    await db.delete(comments).where(eq(comments.userId, userId));
    await db.delete(likes).where(eq(likes.userId, userId));
    await db.delete(follows).where(eq(follows.followerId, userId));
    await db.delete(follows).where(eq(follows.followingId, userId));
    await db.delete(notifications).where(eq(notifications.userId, userId));
    await db.delete(userSettings).where(eq(userSettings.userId, userId));
    await db.delete(blockedUsers).where(eq(blockedUsers.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }

  // ============ BADGES ============
  async getBadges(): Promise<Badge[]> {
    return db.query.badges.findMany();
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  async deleteBadge(badgeId: string): Promise<void> {
    await db.delete(badges).where(eq(badges.id, badgeId));
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const userBadgeRecords = await db.query.userBadges.findMany({ where: eq(userBadges.userId, userId) });
    const badgeIds = userBadgeRecords.map(ub => ub.badgeId);
    if (badgeIds.length === 0) return [];
    return db.query.badges.findMany({ where: inArray(badges.id, badgeIds) });
  }

  async getBadgeUsers(badgeId: string): Promise<User[]> {
    const userBadgeRecords = await db.query.userBadges.findMany({ where: eq(userBadges.badgeId, badgeId) });
    const userIds = userBadgeRecords.map(ub => ub.userId);
    if (userIds.length === 0) return [];
    return db.query.users.findMany({ where: inArray(users.id, userIds) });
  }

  async assignBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [userBadge] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return userBadge;
  }

  async removeBadge(userId: string, badgeId: string): Promise<void> {
    await db.delete(userBadges).where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  }

  async getAllBadgesWithUsers(): Promise<any[]> {
    const allUserBadges = await db.query.userBadges.findMany();
    const badgeLookup = new Map();
    
    for (const ub of allUserBadges) {
      const badge = await db.query.badges.findFirst({ where: eq(badges.id, ub.badgeId) });
      if (badge) {
        if (!badgeLookup.has(ub.userId)) {
          badgeLookup.set(ub.userId, []);
        }
        badgeLookup.get(ub.userId).push(badge);
      }
    }

    const result: any[] = [];
    const entries = Array.from(badgeLookup.entries());
    for (const [userId, userBadges] of entries) {
      for (const badge of userBadges) {
        result.push({
          userId,
          badgeId: badge.id,
          name: badge.name,
          iconSvg: badge.iconSvg,
          description: badge.description,
          type: badge.type,
          id: badge.id,
        });
      }
    }
    return result;
  }

  async saveFCMToken(userId: string, token: string): Promise<void> {
  }

  async getFCMToken(userId: string): Promise<string | undefined> {
    return undefined;
  }
}
