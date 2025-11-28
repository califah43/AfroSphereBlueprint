import type { Express } from "express";
import { createServer, type Server } from "http";
import { MemStorage } from "./storage";

const storage = new MemStorage();
import { insertUserSchema, updateUserSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";

// Export storage for seeding
export { storage };

// Seed data function
async function seedDatabase() {
  const mockPostsData = [
    // Fashion
    { userId: "user-adikeafrica", username: "adikeafrica", caption: "Celebrating our roots with modern style. Ankara fusion fashion dropping soon! #AfricanFashion #AfoStyle", category: "fashion", likes: 1247 },
    { userId: "user-zara_style", username: "zara_style", caption: "New collection: Bold patterns, sustainable fabrics. Shop local, think global. #EthicalFashion #AfricanDesign", category: "fashion", likes: 892 },
    { userId: "user-kente_vibes", username: "kente_vibes", caption: "Traditional kente meets contemporary cuts. The future of African fashion is here. #KenteKing #TraditionalStyle", category: "fashion", likes: 1523 },
    
    // Music
    { userId: "user-amaarabeats", username: "amaarabeats", caption: "Late night sessions creating the future of Afrobeats. Studio vibes. #AfricanMusic #Producer #Afrobeats", category: "music", likes: 2103 },
    { userId: "user-beat_masta", username: "beat_masta", caption: "New track dropping Friday! Afrobeats meets amapiano. Your ears are ready. #NewMusic #Amapiano", category: "music", likes: 1678 },
    { userId: "user-dj_cairo", username: "dj_cairo", caption: "Spinning vibes from Cairo to Nairobi. AfroBeats, Amapiano, House - it's all love. #DJLife #AfricanMusician", category: "music", likes: 1245 },
    
    // Art
    { userId: "user-kojoart", username: "kojoart", caption: "New piece inspired by Adinkra symbols. The journey continues. #AfricanArt #ContemporaryArt #Adinkra", category: "art", likes: 892 },
    { userId: "user-paint_mastery", username: "paint_mastery", caption: "Oil on canvas: A tribute to our ancestors. Art is resistance, art is love. #Painting #ArtistLife", category: "art", likes: 1123 },
    { userId: "user-street_artist", username: "street_artist", caption: "Murals transforming our communities. Art that speaks truth to power. #StreetArt #Activism", category: "art", likes: 1734 },
    
    // Culture
    { userId: "user-culture_keeper", username: "culture_keeper", caption: "Ancient traditions in modern times. Keep your culture alive, pass it on. #CulturalHeritage #Tradition", category: "culture", likes: 1234 },
    { userId: "user-griot_stories", username: "griot_stories", caption: "Storytelling night: Tales passed down for generations. #OralTradition #StorytellingCircle", category: "culture", likes: 876 },
    { userId: "user-festival_vibe", username: "festival_vibe", caption: "Annual cultural festival in full swing! Unity, music, joy. #CulturalFestival #Community", category: "culture", likes: 1678 },
    
    // Lifestyle
    { userId: "user-wellness_guru", username: "wellness_guru", caption: "Morning meditation overlooking the continent. Inner peace equals outer glow. #MindfulLiving #Wellness", category: "lifestyle", likes: 987 },
    { userId: "user-kitchen_diaries", username: "kitchen_diaries", caption: "Traditional recipes with a modern twist. Food is culture on a plate. #AfricanCuisine #FoodBlogger", category: "lifestyle", likes: 1456 },
    { userId: "user-travel_nomad", username: "travel_nomad", caption: "Backpacking through 5 African countries. The continent is calling. #AfricaTravel #Adventure", category: "lifestyle", likes: 1834 },
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

  // Create mock posts
  for (const postData of mockPostsData) {
    const user = await storage.getUserByUsername(postData.username);
    if (user) {
      await storage.createPost({
        userId: user.id,
        image: `https://picsum.photos/400/500?random=${postData.username}&t=${Date.now()}`,
        caption: postData.caption,
        category: postData.category,
      });
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database on startup
  await seedDatabase();

  // ============ AUTH ROUTES ============
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
      let user = await storage.updateUser(req.params.id, updates);
      
      // If user doesn't exist, create them with the updates
      if (!user) {
        const userData = {
          username: `user_${req.params.id.substring(0, 8)}`,
          password: "temp_password",
          ...updates,
        };
        user = await storage.createUser(userData);
      }
      
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
      
      res.json(filtered);
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
