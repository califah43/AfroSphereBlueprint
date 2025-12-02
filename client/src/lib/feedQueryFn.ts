// Extracted query function for HomeFeed to prevent recreation on every render
import { mockPosts } from "@/data/mockData";

export async function fetchHomeFeedPosts(formatTimeAgo: (date: string | null | undefined) => string) {
  try {
    // Get current user ID
    let userId = localStorage.getItem("currentUserId");
    const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    if (userData && userData.id && userData.id !== userId) {
      userId = userData.id;
    }

    // Fetch posts, all users, and all badges in parallel
    const viewerIdParam = userId ? `&viewerId=${userId}` : '';
    const [postsRes, usersRes, badgesRes] = await Promise.all([
      fetch(`/api/posts?limit=50${viewerIdParam}`),
      fetch('/api/users/all'),
      fetch('/api/badges/all'),
    ]);
    
    const posts = await postsRes.json();
    const allUsers = usersRes.ok ? await usersRes.json() : [];
    const allBadges = badgesRes.ok ? await badgesRes.json() : [];
    
    // Create a map for fast user lookup
    const userMap = new Map();
    allUsers.forEach((u: any) => {
      userMap.set(u.id, u);
    });

    // Create a map for fast badge lookup by userId
    const badgeMap = new Map();
    if (Array.isArray(allBadges)) {
      allBadges.forEach((badgeAssignment: any) => {
        if (!badgeMap.has(badgeAssignment.userId)) {
          badgeMap.set(badgeAssignment.userId, []);
        }
        badgeMap.get(badgeAssignment.userId).push({
          id: badgeAssignment.badgeId || badgeAssignment.id,
          name: badgeAssignment.name,
          iconSvg: badgeAssignment.iconSvg,
          type: badgeAssignment.type,
        });
      });
    }

    // Transform real posts using pre-fetched user data, likes, bookmarks, and badges
    // Backend already returns isLiked and isBookmarked, so we use those directly
    const transformedRealPosts = (posts || []).map((p: any) => {
      const user = userMap.get(p.userId);
      return {
        id: p.id,
        author: { 
          id: p.userId,
          username: user?.displayName || "creator",
          uniqueUsername: user?.username || "creator",
          avatar: user?.avatar || "" 
        },
        imageUrl: p.image,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        caption: p.caption,
        likes: p.likes !== undefined ? p.likes : 0,
        comments: p.commentCount !== undefined ? p.commentCount : 0,
        timeAgo: formatTimeAgo(p.createdAt),
        category: p.category || "for-you",
        isLiked: p.isLiked || false,
        isBookmarked: p.isBookmarked || false,
        badges: badgeMap.get(p.userId) || [],
      };
    }).filter((post: any) => post.author.username !== "creator");
    
    // Combine: real posts (newest first) at top, then mock posts below for demo
    return [...transformedRealPosts, ...mockPosts];
  } catch {
    return mockPosts;
  }
}
