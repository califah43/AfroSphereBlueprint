import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ AUTH ROUTES ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(parsed.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      const user = await storage.createUser(parsed);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // ============ USER ROUTES ============
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.get("/api/users/username/:username", async (req, res) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // ============ POST ROUTES ============
  app.get("/api/posts", async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const posts = await storage.listPosts(limit, offset);
    res.json(posts);
  });

  app.get("/api/posts/category/:category", async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const posts = await storage.listPostsByCategory(req.params.category, limit);
    res.json(posts);
  });

  app.get("/api/posts/user/:userId", async (req, res) => {
    const posts = await storage.listPostsByUser(req.params.userId);
    res.json(posts);
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const parsed = insertPostSchema.parse(req.body);
      const post = await storage.createPost(parsed);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    await storage.deletePost(req.params.id);
    res.json({ success: true });
  });

  // ============ COMMENT ROUTES ============
  app.get("/api/comments/post/:postId", async (req, res) => {
    const comments = await storage.listComments(req.params.postId);
    
    // Enrich comments with replies
    const enrichedComments = await Promise.all(comments.map(async (comment) => {
      const replies = await storage.getCommentReplies(comment.id);
      return { ...comment, replies };
    }));
    
    res.json(enrichedComments);
  });

  app.get("/api/comments/:id", async (req, res) => {
    const comment = await storage.getComment(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const parsed = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(parsed);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    await storage.deleteComment(req.params.id);
    res.json({ success: true });
  });

  // ============ LIKE ROUTES ============
  app.post("/api/likes/posts", async (req, res) => {
    try {
      const { userId, postId } = req.body;
      const hasLiked = await storage.hasUserLikedPost(userId, postId);
      
      if (hasLiked) {
        await storage.unlikePost(userId, postId);
        res.json({ liked: false });
      } else {
        await storage.likePost(userId, postId);
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/likes/comments", async (req, res) => {
    try {
      const { userId, commentId } = req.body;
      const comment = await storage.getComment(commentId);
      const hasLiked = comment && (comment.likes || 0) > 0; // Simple check
      
      if (hasLiked) {
        await storage.unlikeComment(userId, commentId);
        res.json({ liked: false });
      } else {
        await storage.likeComment(userId, commentId);
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // ============ FOLLOW ROUTES ============
  app.post("/api/follows", async (req, res) => {
    try {
      const { followerId, followingId } = req.body;
      const isFollowing = await storage.isFollowing(followerId, followingId);
      
      if (isFollowing) {
        await storage.unfollowUser(followerId, followingId);
        res.json({ following: false });
      } else {
        await storage.followUser(followerId, followingId);
        res.json({ following: true });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/follows/followers/:userId", async (req, res) => {
    const followers = await storage.getFollowers(req.params.userId);
    res.json(followers);
  });

  app.get("/api/follows/following/:userId", async (req, res) => {
    const following = await storage.getFollowing(req.params.userId);
    res.json(following);
  });

  // ============ BADGE ROUTES ============
  app.get("/api/badges/:userId", async (req, res) => {
    const badges = await storage.getBadges(req.params.userId);
    res.json(badges || { userId: req.params.userId, badges: [], tier: "bronze" });
  });

  app.post("/api/badges", async (req, res) => {
    try {
      const { userId, badge } = req.body;
      const result = await storage.addBadge(userId, badge);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // ============ NOTIFICATION ROUTES ============
  app.get("/api/notifications/:userId", async (req, res) => {
    const notifications = await storage.listNotifications(req.params.userId);
    res.json(notifications);
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    await storage.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
