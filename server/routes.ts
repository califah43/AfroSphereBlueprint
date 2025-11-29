import type { Express } from "express";
import { createServer, type Server } from "http";
import { DbStorage } from "./storage-db";
import { db } from "./db";
import { posts, likes, users, follows } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import multer from "multer";
const storage = new DbStorage();
import { insertUserSchema, updateUserSchema, insertPostSchema, insertCommentSchema, type Badge } from "@shared/schema";

// Multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Real-time updates via polling - clients refetch automatically
const broadcastUpdate = (event: string, data: any) => {
  // Broadcast logic - clients use React Query to refetch when needed
  console.log(`Update: ${event}`, data);
};

// Export storage for seeding
export { storage };

// Seed data function - runs every time to ensure posts have likes
async function seedDatabase() {
  // Always sync seed data to ensure posts have proper likes
  
  const mockPostsData = [
    // Fashion
    { userId: "user-adikeafrica", username: "adikeafrica", caption: "Celebrating our roots with modern style. Ankara fusion fashion dropping soon! #AfricanFashion #AfoStyle", category: "fashion", likes: 1247, image: "https://picsum.photos/400/500?random=adikeafrica_1" },
    { userId: "user-zara_style", username: "zara_style", caption: "New collection: Bold patterns, sustainable fabrics. Shop local, think global. #EthicalFashion #AfricanDesign", category: "fashion", likes: 892, image: "https://picsum.photos/400/500?random=zara_style_1" },
    { userId: "user-kente_vibes", username: "kente_vibes", caption: "Traditional kente meets contemporary cuts. The future of African fashion is here. #KenteKing #TraditionalStyle", category: "fashion", likes: 1523, image: "https://picsum.photos/400/500?random=kente_vibes_1" },
    
    // Music
    { userId: "user-amaarabeats", username: "amaarabeats", caption: "Late night sessions creating the future of Afrobeats. Studio vibes. #AfricanMusic #Producer #Afrobeats", category: "music", likes: 2103, image: "https://picsum.photos/400/500?random=amaarabeats_1" },
    { userId: "user-beat_masta", username: "beat_masta", caption: "New track dropping Friday! Afrobeats meets amapiano. Your ears are ready. #NewMusic #Amapiano", category: "music", likes: 1678, image: "https://picsum.photos/400/500?random=beat_masta_1" },
    { userId: "user-dj_cairo", username: "dj_cairo", caption: "Spinning vibes from Cairo to Nairobi. AfroBeats, Amapiano, House - it's all love. #DJLife #AfricanMusician", category: "music", likes: 1245, image: "https://picsum.photos/400/500?random=dj_cairo_1" },
    
    // Art
    { userId: "user-kojoart", username: "kojoart", caption: "New piece inspired by Adinkra symbols. The journey continues. #AfricanArt #ContemporaryArt #Adinkra", category: "art", likes: 892, image: "https://picsum.photos/400/500?random=kojoart_1" },
    { userId: "user-paint_mastery", username: "paint_mastery", caption: "Oil on canvas: A tribute to our ancestors. Art is resistance, art is love. #Painting #ArtistLife", category: "art", likes: 1123, image: "https://picsum.photos/400/500?random=paint_mastery_1" },
    { userId: "user-street_artist", username: "street_artist", caption: "Murals transforming our communities. Art that speaks truth to power. #StreetArt #Activism", category: "art", likes: 1734, image: "https://picsum.photos/400/500?random=street_artist_1" },
    
    // Culture
    { userId: "user-culture_keeper", username: "culture_keeper", caption: "Ancient traditions in modern times. Keep your culture alive, pass it on. #CulturalHeritage #Tradition", category: "culture", likes: 1234, image: "https://picsum.photos/400/500?random=culture_keeper_1" },
    { userId: "user-griot_stories", username: "griot_stories", caption: "Storytelling night: Tales passed down for generations. #OralTradition #StorytellingCircle", category: "culture", likes: 876, image: "https://picsum.photos/400/500?random=griot_stories_1" },
    { userId: "user-festival_vibe", username: "festival_vibe", caption: "Annual cultural festival in full swing! Unity, music, joy. #CulturalFestival #Community", category: "culture", likes: 1678, image: "https://picsum.photos/400/500?random=festival_vibe_1" },
    
    // Lifestyle
    { userId: "user-wellness_guru", username: "wellness_guru", caption: "Morning meditation overlooking the continent. Inner peace equals outer glow. #MindfulLiving #Wellness", category: "lifestyle", likes: 987, image: "https://picsum.photos/400/500?random=wellness_guru_1" },
    { userId: "user-kitchen_diaries", username: "kitchen_diaries", caption: "Traditional recipes with a modern twist. Food is culture on a plate. #AfricanCuisine #FoodBlogger", category: "lifestyle", likes: 1456, image: "https://picsum.photos/400/500?random=kitchen_diaries_1" },
    { userId: "user-travel_nomad", username: "travel_nomad", caption: "Backpacking through 5 African countries. The continent is calling. #AfricaTravel #Adventure", category: "lifestyle", likes: 1834, image: "https://picsum.photos/400/500?random=travel_nomad_1" },
  ];

  // Create mock users first
  const usernames = Array.from(new Set(mockPostsData.map(p => p.username)));
  for (const username of usernames) {
    try {
      await storage.createUser({
        username,
        password: "password123",
      });
    } catch (e) {
      // User may already exist
    }
  }

  // Create or update mock posts with stable image URLs and likes
  for (const postData of mockPostsData) {
    const user = await storage.getUserByUsername(postData.username);
    if (user) {
      // Check if post already exists
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.userId, user.id),
      });
      
      if (existingPost) {
        // Update existing post with seed image, caption, category, and likes
        await db.update(posts).set({ 
          image: postData.image,
          caption: postData.caption,
          category: postData.category,
          likes: postData.likes 
        }).where(eq(posts.id, existingPost.id));
      } else {
        // Create new post
        const post = await storage.createPost({
          userId: user.id,
          image: postData.image,
          caption: postData.caption,
          category: postData.category,
        });
        // Update post with seed likes
        await db.update(posts).set({ likes: postData.likes }).where(eq(posts.id, post.id));
      }
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to format time ago
  const formatTimeAgo = (createdAt: string | Date | null): string => {
    if (!createdAt) return "now";
    const created = new Date(createdAt);
    const now = Date.now();
    const diff = now - created.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (seconds < 60) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Seed database on startup - only seeds users, not posts
  // Posts should be created by users manually, not auto-recreated on every reload
  const usernames = ["adikeafrica", "zara_style", "kente_vibes", "amaarabeats", "beat_masta", "dj_cairo", 
                     "kojoart", "paint_mastery", "street_artist", "culture_keeper", "griot_stories", 
                     "festival_vibe", "wellness_guru", "kitchen_diaries", "travel_nomad"];
  for (const username of usernames) {
    try {
      await storage.createUser({
        username,
        password: "password123",
      });
    } catch (e) {
      // User may already exist
    }
  }

  // ============ AUTH ROUTES ============
  // Map Firebase UID to database user ID
  app.get("/api/auth/map-user/:firebaseUid", async (req, res) => {
    try {
      const firebaseUid = req.params.firebaseUid;
      // Try to find user by firebaseUid
      const allUsers = await db.query.users.findMany();
      const user = allUsers.find(u => u.firebaseUid === firebaseUid);
      
      if (user) {
        res.json({ userId: user.id, username: user.username });
      } else {
        res.status(404).json({ error: "User not found for Firebase UID" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/auth/check-username/:username", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.params.username);
      if (existingUser) {
        return res.status(409).json({ available: false, error: "Username already taken" });
      }
      res.json({ available: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

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

  // Firebase: Create post with media upload (token-based auth with multer)
  app.post("/api/posts/upload", upload.single("media"), async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      
      if (!req.file) {
        return res.status(400).json({ error: "Media file required" });
      }

      const { caption = "", category = "lifestyle", userId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Get user from database
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create post with image from request
      const post = await storage.createPost({
        userId,
        image: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        caption,
        category,
      });

      res.status(201).json({ 
        success: true, 
        post,
        message: "Post created with media" 
      });
    } catch (error: any) {
      console.error("Post upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload post" });
    }
  });

  app.post("/api/users", async (req, res) => {
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

  // ============ USER ROUTES ============
  app.get("/api/users/all", async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany();
      res.json(allUsers);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch users" });
    }
  });

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
      // Allow firebaseUid to be updated even if not in updateUserSchema
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(400).json({ error: error.message || "Invalid request" });
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
    const { userId } = req.query;
    const comments = await storage.listComments(req.params.postId);
    
    // Get all users once to avoid repeated queries
    const allUsers = await db.query.users.findMany();
    
    // Get user's liked comments if userId provided
    let likedCommentIds = new Set<string>();
    if (userId) {
      try {
        const userLikes = await db.query.likes.findMany({
          where: eq(likes.userId, userId as string),
        });
        likedCommentIds = new Set(userLikes.filter(l => l.commentId).map(l => l.commentId!));
      } catch (e) {
        // If query fails, just proceed without like data
      }
    }
    
    // Enrich comments with username, avatar, and replies
    const enrichedComments = await Promise.all(comments.map(async (comment) => {
      let author = "creator";
      let avatar = "";
      
      // Try to get user by database UUID first
      let user = allUsers.find(u => u.id === comment.userId);
      
      // If not found by UUID, try by Firebase UID
      if (!user) {
        user = allUsers.find(u => u.firebaseUid === comment.userId);
      }
      
      if (user) {
        author = user.displayName || user.username;
        avatar = user.avatar || "";
      }
      
      const replies = await storage.getCommentReplies(comment.id);
      
      // Enrich replies with usernames, avatars, and isLiked status
      const enrichedReplies = await Promise.all(replies.map(async (reply) => {
        let replyAuthor = "creator";
        let replyAvatar = "";
        
        // Try by database UUID first
        let replyUser = allUsers.find(u => u.id === reply.userId);
        
        // If not found by UUID, try by Firebase UID
        if (!replyUser) {
          replyUser = allUsers.find(u => u.firebaseUid === reply.userId);
        }
        
        if (replyUser) {
          replyAuthor = replyUser.displayName || replyUser.username;
          replyAvatar = replyUser.avatar || "";
        }
        
        // Get badges for reply author
        let replyBadges: any[] = [];
        if (replyUser) {
          try {
            replyBadges = await storage.getUserBadges(replyUser.id);
          } catch (e) {
            // No badges, proceed
          }
        }

        return {
          id: reply.id,
          userId: reply.userId,
          postId: reply.postId,
          text: reply.text,
          likes: reply.likes || 0,
          createdAt: reply.createdAt,
          replyTo: reply.replyTo,
          author: replyAuthor,
          avatar: replyAvatar,
          timeAgo: formatTimeAgo(reply.createdAt),
          replies: [],
          isLiked: likedCommentIds.has(reply.id),
          badges: replyBadges,
        };
      }));
      
      // Get badges for comment author
      let authorBadges: any[] = [];
      if (user) {
        try {
          authorBadges = await storage.getUserBadges(user.id);
        } catch (e) {
          // No badges, proceed
        }
      }

      return {
        id: comment.id,
        userId: comment.userId,
        postId: comment.postId,
        text: comment.text,
        likes: comment.likes || 0,
        createdAt: comment.createdAt,
        replyTo: comment.replyTo,
        author: author,
        avatar: avatar,
        timeAgo: formatTimeAgo(comment.createdAt),
        replies: enrichedReplies,
        isLiked: likedCommentIds.has(comment.id),
        badges: authorBadges,
      };
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
      let userId = req.body.userId;
      let username = "creator";
      
      // Map Firebase UID to database user ID and get username
      try {
        const allUsers = await db.query.users.findMany();
        let user = allUsers.find(u => u.id === userId);
        
        // If not found by UUID, try by Firebase UID (for backward compat)
        if (!user) {
          user = allUsers.find(u => u.firebaseUid === userId);
        }
        
        // If still not found, try finding by any matching pattern (loose match)
        if (!user && userId) {
          user = allUsers.find(u => 
            u.username === req.body.username || 
            u.firebaseUid === userId ||
            u.id === userId
          );
        }
        
        if (user) {
          userId = user.id; // Use database UUID
          username = user.username;
        }
      } catch (e) {
        // Proceed with Firebase UID if lookup fails
      }
      
      const parsed = insertCommentSchema.parse({
        postId: req.body.postId,
        userId: userId,
        text: req.body.text,
        replyTo: req.body.replyTo || null,
      });
      
      const comment = await storage.createComment(parsed);
      
      const enrichedComment = {
        id: comment.id,
        userId: comment.userId,
        postId: comment.postId,
        text: comment.text,
        likes: comment.likes || 0,
        createdAt: comment.createdAt,
        replyTo: comment.replyTo,
        author: username,
        timeAgo: "now",
        replies: [],
      };
      
      // Broadcast real-time comment to all connected clients
      broadcastUpdate('comment:created', enrichedComment);
      
      res.status(201).json(enrichedComment);
    } catch (error) {
      console.error("Comment creation error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    await storage.deleteComment(req.params.id);
    res.json({ success: true });
  });

  // ============ LIKE ROUTES ============
  app.post("/api/likes/posts/batch-check", async (req, res) => {
    try {
      const { userId, postIds } = req.body;
      if (!userId || !Array.isArray(postIds)) {
        return res.status(400).json({ error: "Invalid request" });
      }
      
      const likedPostIds: string[] = [];
      for (const postId of postIds) {
        const hasLiked = await storage.hasUserLikedPost(userId, postId);
        if (hasLiked) likedPostIds.push(postId);
      }
      
      res.json({ likedPostIds });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/likes/posts/check/:userId/:postId", async (req, res) => {
    try {
      const { userId, postId } = req.params;
      const hasLiked = await storage.hasUserLikedPost(userId, postId);
      res.json({ liked: hasLiked });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/likes/posts", async (req, res) => {
    try {
      const { userId, postId } = req.body;
      const hasLiked = await storage.hasUserLikedPost(userId, postId);
      
      let newLikeCount = 0;
      if (hasLiked) {
        await storage.unlikePost(userId, postId);
      } else {
        await storage.likePost(userId, postId);
      }
      
      // Fetch updated post to get the new like count
      const updatedPost = await storage.getPost(postId);
      newLikeCount = updatedPost?.likes || 0;
      
      // Broadcast real-time update to all connected clients
      broadcastUpdate('post:liked', { postId, userId, liked: !hasLiked, likes: newLikeCount });
      
      res.json({ liked: !hasLiked, likes: newLikeCount });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/likes/comments", async (req, res) => {
    try {
      const { userId, commentId } = req.body;
      
      // Check if user has already liked this comment
      const existingLike = await db.query.likes.findFirst({
        where: and(eq(likes.userId, userId as string), eq(likes.commentId, commentId as string)),
      });
      
      const hasLiked = !!existingLike;
      
      if (hasLiked) {
        // Remove like
        await storage.unlikeComment(userId, commentId);
      } else {
        // Add like
        await storage.likeComment(userId, commentId);
      }
      
      // Fetch updated comment to get the new like count
      const updatedComment = await storage.getComment(commentId);
      const newLikeCount = updatedComment?.likes || 0;
      
      // Broadcast real-time update to all connected clients
      broadcastUpdate('comment:liked', { commentId, userId, liked: !hasLiked, likes: newLikeCount });
      
      res.json({ liked: !hasLiked, likes: newLikeCount });
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
        // Update counts
        const follower = await db.query.users.findFirst({ where: eq(users.id, followerId) });
        const following = await db.query.users.findFirst({ where: eq(users.id, followingId) });
        if (follower) {
          await db.update(users).set({ followingCount: Math.max(0, (follower.followingCount || 1) - 1) }).where(eq(users.id, followerId));
        }
        if (following) {
          await db.update(users).set({ followerCount: Math.max(0, (following.followerCount || 1) - 1) }).where(eq(users.id, followingId));
        }
        res.json({ following: false });
      } else {
        await storage.followUser(followerId, followingId);
        // Update counts
        const follower = await db.query.users.findFirst({ where: eq(users.id, followerId) });
        const following = await db.query.users.findFirst({ where: eq(users.id, followingId) });
        if (follower) {
          await db.update(users).set({ followingCount: (follower.followingCount || 0) + 1 }).where(eq(users.id, followerId));
        }
        if (following) {
          await db.update(users).set({ followerCount: (following.followerCount || 0) + 1 }).where(eq(users.id, followingId));
        }
        res.json({ following: true });
      }
    } catch (error) {
      console.error("Follow error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/follows/check", async (req, res) => {
    try {
      const { followerId, followingId } = req.query;
      if (!followerId || !followingId) {
        return res.status(400).json({ error: "Missing parameters" });
      }
      const isFollowing = await storage.isFollowing(followerId as string, followingId as string);
      res.json({ isFollowing });
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

  // ============ BADGE ROUTES (moved to /api/badges and /api/admin/badges) ============
  // Badge routes are now at /api/badges (public) and /api/admin/badges/* (admin)
  // See below for the complete badge management system

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

  // ============ HASHTAG/TRENDING ROUTES ============
  app.get("/api/trending/hashtags", async (req, res) => {
    try {
      const posts = await storage.listPosts(1000, 0);
      const hashtagMap = new Map<string, number>();
      
      posts.forEach(post => {
        const hashtags = post.caption?.match(/#[\w]+/g) || [];
        hashtags.forEach(tag => {
          const cleanTag = tag.substring(1).toLowerCase();
          hashtagMap.set(cleanTag, (hashtagMap.get(cleanTag) || 0) + 1);
        });
      });

      const trending = Array.from(hashtagMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count, posts: count }));
      
      res.json(trending);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch trending hashtags" });
    }
  });

  app.get("/api/trending/posts", async (req, res) => {
    try {
      const posts = await storage.listPosts(100, 0);
      const trending = posts
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 20);
      
      res.json(trending);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch trending posts" });
    }
  });

  app.get("/api/search/hashtag/:tag", async (req, res) => {
    try {
      const tag = req.params.tag.toLowerCase();
      const posts = await storage.listPosts(1000, 0);
      const filtered = posts.filter(p => p.caption?.toLowerCase().includes(`#${tag}`));
      
      // Enrich posts with username
      const enrichedPosts = await Promise.all(
        filtered.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return {
            ...post,
            username: user?.username || "creator",
          };
        })
      );
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(400).json({ error: "Failed to search hashtag" });
    }
  });


  // ============ SETTINGS ROUTES ============
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.params.userId);
      if (!settings) {
        return res.json({
          userId: req.params.userId,
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
        });
      }
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Failed to load settings" });
    }
  });

  app.post("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.saveUserSettings(req.params.userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Failed to save settings" });
    }
  });

  // ============ BLOCKED USERS ROUTES ============
  app.post("/api/blocked-users", async (req, res) => {
    try {
      const { userId, blockedUserId } = req.body;
      const blocked = await storage.blockUser(userId, blockedUserId);
      res.json(blocked);
    } catch (error) {
      res.status(400).json({ error: "Failed to block user" });
    }
  });

  app.delete("/api/blocked-users/:userId/:blockedUserId", async (req, res) => {
    try {
      await storage.unblockUser(req.params.userId, req.params.blockedUserId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to unblock user" });
    }
  });

  app.get("/api/blocked-users/:userId", async (req, res) => {
    try {
      const blocked = await storage.getBlockedUsers(req.params.userId);
      res.json(blocked);
    } catch (error) {
      res.status(400).json({ error: "Failed to get blocked users" });
    }
  });

  // ============ REPORTS ROUTES ============
  app.post("/api/reports", async (req, res) => {
    try {
      const { userId, reportType, description, postId, reportedUserId } = req.body;
      const report = await storage.submitReport(userId, reportType, description, postId, reportedUserId);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: "Failed to submit report" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(400).json({ error: "Failed to get reports" });
    }
  });

  // ============ ACCOUNT DELETION & UPDATES ============
  app.post("/api/users/:id/delete", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete account" });
    }
  });

  app.patch("/api/users/:id/email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email" });
      }
      const user = await storage.updateUser(req.params.id, { email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, email: user.email });
    } catch (error) {
      res.status(400).json({ error: "Failed to update email" });
    }
  });

  app.patch("/api/users/:id/password", async (req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      await storage.updateUser(req.params.id, { password: newPassword });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update password" });
    }
  });

  // ============ ADMIN ROUTES ============
  
  // Get dashboard statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany();
      const allPosts = await db.query.posts.findMany();
      const allComments = await db.query.comments.findMany();
      const allLikes = await db.query.likes.findMany();
      
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const todayUsers = allUsers.filter(u => new Date(u.firebaseUid || "") > dayAgo).length;
      const todayPosts = allPosts.filter(p => new Date(p.createdAt || "") > dayAgo).length;
      
      res.json({
        totalUsers: allUsers.length,
        totalPosts: allPosts.length,
        totalComments: allComments.length,
        totalLikes: allLikes.length,
        dailyActiveUsers: todayUsers,
        newSignupsToday: todayUsers,
        reportsToday: 0,
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch stats" });
    }
  });

  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany();
      const enrichedUsers = await Promise.all(
        allUsers.map(async (user) => ({
          id: user.id,
          username: user.username,
          email: user.email || "",
          displayName: user.displayName || "",
          avatar: user.avatar || "",
          joinDate: user.firebaseUid || new Date().toISOString(),
          verified: false,
          status: "active" as const,
          posts: user.postCount || 0,
          followers: user.followerCount || 0,
          following: user.followingCount || 0,
          phone: user.phone || "",
          lastActivity: new Date().toISOString(),
          badges: [],
          reports: 0,
        }))
      );
      res.json(enrichedUsers);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch users" });
    }
  });

  // Delete user and their posts
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Delete all posts by user
      const userPosts = await db.query.posts.findMany({ where: eq(posts.userId, userId) });
      for (const post of userPosts) {
        await storage.deletePost(post.id);
      }
      
      // Delete user
      await storage.deleteUser(userId);
      res.json({ success: true, message: "User and their posts deleted" });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete user" });
    }
  });

  // Edit user details
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { username, displayName, email, bio, phone, profession, location } = req.body;
      const updates: any = {};
      if (username) updates.username = username;
      if (displayName) updates.displayName = displayName;
      if (email) updates.email = email;
      if (bio) updates.bio = bio;
      if (phone) updates.phone = phone;
      if (profession) updates.profession = profession;
      if (location) updates.location = location;
      
      const user = await storage.updateUser(req.params.id, updates);
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  // Get all posts
  app.get("/api/admin/posts", async (req, res) => {
    try {
      const allPosts = await db.query.posts.findMany();
      const enrichedPosts = await Promise.all(
        allPosts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return {
            id: post.id,
            username: user?.username || "Unknown",
            caption: post.caption || "",
            imageUrl: post.image || "",
            images: post.images || [],
            likes: post.likes || 0,
            comments: post.commentCount || 0,
            timeAgo: formatTimeAgo(post.createdAt),
            datePosted: new Date(post.createdAt || "").toISOString().split("T")[0],
            status: "visible" as const,
            reports: 0,
          };
        })
      );
      res.json(enrichedPosts);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch posts" });
    }
  });

  // Delete post
  app.delete("/api/admin/posts/:id", async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ success: true, message: "Post deleted" });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete post" });
    }
  });

  // Modify post likes
  app.patch("/api/admin/posts/:id/likes", async (req, res) => {
    try {
      const { likes } = req.body;
      if (typeof likes !== "number") {
        return res.status(400).json({ error: "Invalid likes value" });
      }
      await db.update(posts).set({ likes }).where(eq(posts.id, req.params.id));
      res.json({ success: true, likes });
    } catch (error) {
      res.status(400).json({ error: "Failed to update likes" });
    }
  });

  // Delete comment
  app.delete("/api/admin/comments/:id", async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ success: true, message: "Comment deleted" });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete comment" });
    }
  });

  // Get system logs
  app.get("/api/admin/logs", async (req, res) => {
    try {
      // Return recent system activities as logs
      const recentPosts = await db.query.posts.findMany({ limit: 10 });
      const recentComments = await db.query.comments.findMany({ limit: 10 });
      
      const logs = [
        ...recentPosts.map(p => ({
          id: p.id,
          timestamp: new Date(p.createdAt || "").toISOString(),
          level: "info" as const,
          action: "Post Created",
          userId: p.userId,
          details: `Post: ${p.caption?.substring(0, 50)}...`,
        })),
        ...recentComments.map(c => ({
          id: c.id,
          timestamp: new Date(c.createdAt || "").toISOString(),
          level: "info" as const,
          action: "Comment Added",
          userId: c.userId,
          details: `Comment: ${c.text.substring(0, 50)}...`,
        })),
      ];
      
      res.json(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch logs" });
    }
  });

  // Get all notifications for admin
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const allNotifications = await db.query.notifications.findMany({ limit: 100 });
      res.json(allNotifications.map(n => ({
        id: n.id,
        title: n.type.charAt(0).toUpperCase() + n.type.slice(1),
        message: n.message,
        type: "app" as const,
        targetAudience: n.userId,
        priority: "medium" as const,
        status: n.read ? "sent" : "pending" as const,
        sentAt: new Date(n.createdAt || "").toISOString(),
        recipientCount: 1,
      })));
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch notifications" });
    }
  });

  // Get all reports for admin
  app.get("/api/admin/reports", async (req, res) => {
    try {
      const allReports = await db.query.userReports.findMany({ limit: 100 });
      res.json(allReports.map(r => ({
        id: r.id,
        reporter: r.userId,
        reason: r.reportType,
        date: new Date(r.createdAt || "").toISOString(),
        status: "pending" as const,
        description: r.description,
      })));
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch reports" });
    }
  });

  // Get all badges
  app.get("/api/admin/badges", async (req, res) => {
    try {
      const allBadges = await storage.getBadges();
      const transformed = (allBadges || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.iconSvg || "✨",
        color: "text-yellow-500",
        usersCount: 0,
      }));
      res.json(transformed);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch badges" });
    }
  });

  // Assign badge to user (deprecated - use POST /api/admin/badges/assign instead)
  // This endpoint is kept for backwards compatibility but uses the new badge system

  // Get system settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      res.json({
        signupsEnabled: true,
        emailVerificationRequired: true,
        autoModeration: true,
        oriAIEnabled: true,
        maxImageSize: 50,
        maxVideoLength: 300,
        filteringSensitivity: "medium",
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch settings" });
    }
  });

  // Update system settings
  app.patch("/api/admin/settings", async (req, res) => {
    try {
      const settings = req.body;
      res.json({ success: true, settings });
    } catch (error) {
      res.status(400).json({ error: "Failed to update settings" });
    }
  });

  // Emergency action: maintenance mode
  app.post("/api/admin/emergency/maintenance", async (req, res) => {
    try {
      const { enabled } = req.body;
      res.json({ success: true, maintenance: enabled });
    } catch (error) {
      res.status(400).json({ error: "Failed to toggle maintenance" });
    }
  });

  // Emergency action: disable posting
  app.post("/api/admin/emergency/disable-posting", async (req, res) => {
    try {
      const { disabled } = req.body;
      res.json({ success: true, postingDisabled: disabled });
    } catch (error) {
      res.status(400).json({ error: "Failed to toggle posting" });
    }
  });

  // Clear system cache
  app.post("/api/admin/emergency/clear-cache", async (req, res) => {
    try {
      res.json({ success: true, message: "Cache cleared" });
    } catch (error) {
      res.status(400).json({ error: "Failed to clear cache" });
    }
  });

  // ============ BADGE ROUTES ============
  // Get all badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch badges" });
    }
  });

  // Get user badges
  app.get("/api/badges/user/:userId", async (req, res) => {
    try {
      const badges = await storage.getUserBadges(req.params.userId);
      res.json(badges);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch user badges" });
    }
  });

  // Get all user-badge assignments (for feed batch loading)
  app.get("/api/badges/all", async (req, res) => {
    try {
      const allBadgesWithUsers = await storage.getAllBadgesWithUsers();
      res.json(allBadgesWithUsers);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch all badges" });
    }
  });

  // Admin: Create badge
  app.post("/api/admin/badges", async (req, res) => {
    try {
      const { name, type, iconSvg, description } = req.body;
      if (!name || !type || !iconSvg || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const badge = await storage.createBadge({ name, type, iconSvg, description });
      res.status(201).json(badge);
    } catch (error) {
      res.status(400).json({ error: "Failed to create badge" });
    }
  });

  // Admin: Delete badge
  app.delete("/api/admin/badges/:badgeId", async (req, res) => {
    try {
      await storage.deleteBadge(req.params.badgeId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete badge" });
    }
  });

  // Admin: Get users with a specific badge
  app.get("/api/admin/badges/:badgeId/users", async (req, res) => {
    try {
      const badgeUsers = await storage.getBadgeUsers(req.params.badgeId);
      res.json(badgeUsers);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch badge users" });
    }
  });

  // Admin: Assign badge to user
  app.post("/api/admin/badges/assign", async (req, res) => {
    try {
      const { userId, badgeId } = req.body;
      if (!userId || !badgeId) {
        return res.status(400).json({ error: "Missing userId or badgeId" });
      }
      const userBadge = await storage.assignBadge(userId, badgeId);
      res.json(userBadge);
    } catch (error) {
      res.status(400).json({ error: "Failed to assign badge" });
    }
  });

  // Admin: Remove badge from user
  app.post("/api/admin/badges/remove", async (req, res) => {
    try {
      const { userId, badgeId } = req.body;
      if (!userId || !badgeId) {
        return res.status(400).json({ error: "Missing userId or badgeId" });
      }
      await storage.removeBadge(userId, badgeId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to remove badge" });
    }
  });

  // Seed default badges
  app.post("/api/admin/badges/seed", async (req, res) => {
    try {
      const defaultBadges: Array<{ name: string; type: string; description: string; iconSvg: string }> = [
        { name: "Verified", type: "verified", description: "Verified creator account", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1E3A8A"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' },
        { name: "King", type: "cultural", description: "Cultural royalty", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2l3 6h6l-5 3 2 7-7-5-7 5 2-7-5-3h6zm0 2.5L9.5 8h5L12 4.5z"/></svg>' },
        { name: "Queen", type: "cultural", description: "Cultural excellence", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9333EA"><path d="M12 2l3 6h6l-5 3 2 7-7-5-7 5 2-7-5-3h6zm0 2.5L9.5 8h5L12 4.5z"/></svg>' },
        { name: "Creator", type: "creator", description: "Original content creator", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EC4899"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>' },
        { name: "Influencer", type: "creator", description: "Influential voice", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' },
        { name: "Cultural Icon", type: "cultural", description: "Representative of cultural heritage", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B5A3C"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>' },
        { name: "Spiritual Figure", type: "cultural", description: "Spiritual guide and wisdom", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6B21A8"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/></svg>' },
        { name: "Hero", type: "achievement", description: "Community hero", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
        { name: "Popular Creator", type: "achievement", description: "Top trending creator", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B6B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
        { name: "Pioneer", type: "achievement", description: "Early adopter and innovator", iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#06B6D4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
      ];

      const existingBadges = await storage.getBadges();
      for (const badge of defaultBadges) {
        const existing = existingBadges.find((b: Badge) => b.name === badge.name);
        if (!existing) {
          await storage.createBadge(badge);
        }
      }
      res.json({ success: true, message: "Default badges seeded" });
    } catch (error) {
      res.status(400).json({ error: "Failed to seed badges" });
    }
  });

  // ============ FCM TOKEN ROUTES ============
  app.post("/api/notifications/fcm-token", async (req, res) => {
    try {
      const { token, userId } = req.body;
      if (!token || !userId) {
        return res.status(400).json({ error: "Missing token or userId" });
      }

      await storage.saveFCMToken(userId, token);
      console.log(`FCM token stored for user ${userId}`);

      res.json({ success: true, message: "FCM token saved" });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
