import { type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Like, type Follow, type CreatorBadge, type Notification, type UserSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: any): Promise<User | undefined>;
  
  // Posts
  getPost(id: string): Promise<Post | undefined>;
  listPosts(limit?: number, offset?: number): Promise<Post[]>;
  listPostsByUser(userId: string): Promise<Post[]>;
  listPostsByCategory(category: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: string): Promise<void>;
  
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
  
  // Follows
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Creator Badges
  getBadges(userId: string): Promise<CreatorBadge | undefined>;
  addBadge(userId: string, badge: string): Promise<CreatorBadge>;
  
  // Notifications
  createNotification(notification: any): Promise<Notification>;
  listNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
  saveFCMToken(userId: string, token: string): Promise<void>;
  getFCMToken(userId: string): Promise<string | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private comments: Map<string, Comment> = new Map();
  private likes: Map<string, Like> = new Map();
  private follows: Map<string, Follow> = new Map();
  private badges: Map<string, CreatorBadge> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private settings: Map<string, UserSettings> = new Map();
  private fcmTokens: Map<string, string> = new Map(); // userId -> fcmToken

  // ============ USERS ============
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      displayName: "",
      bio: "",
      location: "",
      avatar: "",
      banner: "",
      website: "",
      profession: "",
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: any): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // ============ POSTS ============
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async listPosts(limit = 20, offset = 0): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }

  async listPostsByUser(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async listPostsByCategory(category: string, limit = 20): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(p => p.category === category)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = randomUUID();
    const newPost: Post = {
      ...post,
      caption: post.caption || null,
      id,
      likes: 0,
      commentCount: 0,
      createdAt: new Date(),
    };
    this.posts.set(id, newPost);
    const user = this.users.get(post.userId);
    if (user) {
      user.postCount = (user.postCount || 0) + 1;
      this.users.set(post.userId, user);
    }
    return newPost;
  }

  async deletePost(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      const user = this.users.get(post.userId);
      if (user) {
        user.postCount = Math.max(0, (user.postCount || 1) - 1);
        this.users.set(post.userId, user);
      }
    }
    this.posts.delete(id);
  }

  // ============ COMMENTS ============
  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async listComments(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.postId === postId && !c.replyTo)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.replyTo === commentId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      ...comment,
      replyTo: comment.replyTo || null,
      id,
      likes: 0,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    const post = this.posts.get(comment.postId);
    if (post) {
      post.commentCount = (post.commentCount || 0) + 1;
      this.posts.set(comment.postId, post);
    }
    return newComment;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = this.comments.get(id);
    if (comment) {
      const post = this.posts.get(comment.postId);
      if (post) {
        post.commentCount = Math.max(0, (post.commentCount || 1) - 1);
        this.posts.set(comment.postId, post);
      }
    }
    this.comments.delete(id);
  }

  // ============ LIKES ============
  async likePost(userId: string, postId: string): Promise<Like> {
    // Check if user already liked this post - prevent duplicates
    const existingLike = Array.from(this.likes.values()).find(l => l.userId === userId && l.postId === postId);
    if (existingLike) {
      return existingLike; // Return existing like, don't create duplicate
    }
    
    const id = randomUUID();
    const like: Like = { id, userId, postId, commentId: null, createdAt: new Date() };
    this.likes.set(id, like);
    const post = this.posts.get(postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.posts.set(postId, post);
    }
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const like = Array.from(this.likes.values()).find(l => l.userId === userId && l.postId === postId);
    if (like) {
      this.likes.delete(like.id);
      const post = this.posts.get(postId);
      if (post) {
        post.likes = Math.max(0, (post.likes || 1) - 1);
        this.posts.set(postId, post);
      }
    }
  }

  async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
    return !!Array.from(this.likes.values()).find(l => l.userId === userId && l.postId === postId);
  }

  async likeComment(userId: string, commentId: string): Promise<Like> {
    // Check if user already liked this comment - prevent duplicates
    const existingLike = Array.from(this.likes.values()).find(l => l.userId === userId && l.commentId === commentId);
    if (existingLike) {
      return existingLike; // Return existing like, don't create duplicate
    }
    
    const id = randomUUID();
    const like: Like = { id, userId, postId: null, commentId, createdAt: new Date() };
    this.likes.set(id, like);
    const comment = this.comments.get(commentId);
    if (comment) {
      comment.likes = (comment.likes || 0) + 1;
      this.comments.set(commentId, comment);
    }
    return like;
  }

  async unlikeComment(userId: string, commentId: string): Promise<void> {
    const like = Array.from(this.likes.values()).find(l => l.userId === userId && l.commentId === commentId);
    if (like) {
      this.likes.delete(like.id);
      const comment = this.comments.get(commentId);
      if (comment) {
        comment.likes = Math.max(0, (comment.likes || 1) - 1);
        this.comments.set(commentId, comment);
      }
    }
  }

  // ============ FOLLOWS ============
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const id = randomUUID();
    const follow: Follow = { id, followerId, followingId, createdAt: new Date() };
    this.follows.set(id, follow);
    
    const follower = this.users.get(followerId);
    if (follower) {
      follower.followingCount = (follower.followingCount || 0) + 1;
      this.users.set(followerId, follower);
    }
    
    const following = this.users.get(followingId);
    if (following) {
      following.followerCount = (following.followerCount || 0) + 1;
      this.users.set(followingId, following);
    }
    
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = Array.from(this.follows.values()).find(f => f.followerId === followerId && f.followingId === followingId);
    if (follow) {
      this.follows.delete(follow.id);
      
      const follower = this.users.get(followerId);
      if (follower) {
        follower.followingCount = Math.max(0, (follower.followingCount || 1) - 1);
        this.users.set(followerId, follower);
      }
      
      const following = this.users.get(followingId);
      if (following) {
        following.followerCount = Math.max(0, (following.followerCount || 1) - 1);
        this.users.set(followingId, following);
      }
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return !!Array.from(this.follows.values()).find(f => f.followerId === followerId && f.followingId === followingId);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    return followerIds.map(id => this.users.get(id)).filter((u): u is User => !!u);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    return followingIds.map(id => this.users.get(id)).filter((u): u is User => !!u);
  }

  // ============ BADGES ============
  async getBadges(userId: string): Promise<CreatorBadge | undefined> {
    return Array.from(this.badges.values()).find(b => b.userId === userId);
  }

  async addBadge(userId: string, badge: string): Promise<CreatorBadge> {
    let badgeRecord = Array.from(this.badges.values()).find(b => b.userId === userId);
    if (!badgeRecord) {
      const id = randomUUID();
      badgeRecord = {
        id,
        userId,
        badges: [badge],
        tier: "bronze",
        createdAt: new Date(),
      };
      this.badges.set(id, badgeRecord);
    } else {
      const badges = Array.isArray(badgeRecord.badges) ? badgeRecord.badges : [];
      if (!badges.includes(badge)) {
        badgeRecord.badges = [...badges, badge];
        this.badges.set(badgeRecord.id, badgeRecord);
      }
    }
    return badgeRecord;
  }

  // ============ NOTIFICATIONS ============
  async createNotification(notification: any): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async listNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  // ============ SETTINGS ============
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.settings.values()).find(s => s.userId === userId);
  }

  async saveUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    let settings = Array.from(this.settings.values()).find(s => s.userId === userId);
    const defaults = {
      userId,
      privateAccount: false,
      allowComments: true,
      allowMentions: true,
      notificationsLikes: true,
      notificationsComments: true,
      notificationsFollows: true,
      notificationsTrending: true,
      notificationsPush: true,
      notificationsEmail: true,
      privacyActivityStatus: true,
      privacyReadReceipts: true,
      contentHideExplicit: false,
      contentMutedWords: false,
      contentRestrictedMode: false,
      displayDarkMode: true,
      displayTextSize: "normal",
      displayLanguage: "en",
      updatedAt: new Date(),
    } as UserSettings;
    
    if (!settings) {
      settings = { ...defaults, ...updates, userId } as UserSettings;
    } else {
      settings = { ...settings, ...updates, updatedAt: new Date(), userId };
    }
    this.settings.set(userId, settings);
    return settings;
  }

  // ============ FCM TOKENS ============
  async saveFCMToken(userId: string, token: string): Promise<void> {
    this.fcmTokens.set(userId, token);
  }

  async getFCMToken(userId: string): Promise<string | undefined> {
    return this.fcmTokens.get(userId);
  }

  async getAllFCMTokens(): Promise<Map<string, string>> {
    return this.fcmTokens;
  }
}

export const storage = new MemStorage();
