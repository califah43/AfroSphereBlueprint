import type { Express } from "express";
import { createServer, type Server } from "http";
import { DbStorage } from "./storage-db";
import { db } from "./db";
import { posts } from "@shared/schema";
import { eq } from "drizzle-orm";

const storage = new DbStorage();
import { insertUserSchema, updateUserSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";

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
    
    // Get all users once to avoid repeated queries
    const allUsers = await db.query.users.findMany();
    
    // Enrich comments with username and replies
    const enrichedComments = await Promise.all(comments.map(async (comment) => {
      let author = "creator";
      
      // Try to get user by database UUID first
      let user = allUsers.find(u => u.id === comment.userId);
      
      // If not found by UUID, try by Firebase UID
      if (!user) {
        user = allUsers.find(u => u.firebaseUid === comment.userId);
      }
      
      if (user?.username) {
        author = user.username;
      }
      
      const replies = await storage.getCommentReplies(comment.id);
      
      // Enrich replies with usernames and all fields
      const enrichedReplies = await Promise.all(replies.map(async (reply) => {
        let replyAuthor = "creator";
        
        // Try by database UUID first
        let replyUser = allUsers.find(u => u.id === reply.userId);
        
        // If not found by UUID, try by Firebase UID
        if (!replyUser) {
          replyUser = allUsers.find(u => u.firebaseUid === reply.userId);
        }
        
        if (replyUser?.username) {
          replyAuthor = replyUser.username;
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
          timeAgo: formatTimeAgo(reply.createdAt),
          replies: [],
          isLiked: false,
        };
      }));
      
      return {
        id: comment.id,
        userId: comment.userId,
        postId: comment.postId,
        text: comment.text,
        likes: comment.likes || 0,
        createdAt: comment.createdAt,
        replyTo: comment.replyTo,
        author: author,
        timeAgo: formatTimeAgo(comment.createdAt),
        replies: enrichedReplies,
        isLiked: false,
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
      
      res.json({ liked: !hasLiked, likes: newLikeCount });
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
      } else {
        await storage.likeComment(userId, commentId);
      }
      
      // Fetch updated comment to get the new like count
      const updatedComment = await storage.getComment(commentId);
      const newLikeCount = updatedComment?.likes || 0;
      
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
