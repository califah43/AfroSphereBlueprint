# AfroSphere

## Overview

AfroSphere is a cultural social media platform designed for African creators to share and celebrate fashion, art, music, culture, and lifestyle content. The application provides a modern, engaging feed-based experience inspired by Instagram's clean presentation and TikTok's interactive mechanics, specifically tailored for African creative expression.

## Current Status

✅ **PRODUCTION READY** - Complete end-to-end functionality with all optimizations:
- Email/password signup and login with proper database mapping
- Google Sign-In/Sign-Up fully integrated and working
- Posts appear instantly in feed with correct usernames
- Like/unlike functionality with accurate counts
- Comments system with proper user attribution
- Session persistence - stays logged in on page reload
- Firebase authentication properly synced to PostgreSQL database
- Posts sorted by newest first
- **Optimized Post Creation** - New posts appear instantly with optimistic cache updates
- **Real-time Follow Updates** - Following/follower counts update immediately when following/unfollowing
- **Clickable Follower Lists** - Users can navigate to profiles from followers/following screens
- **Real Follower Data** - Suggested creators show actual database follower counts

## Session 3 Optimization Updates

**Performance Improvements:**
1. **Post Creation Speed** - Implemented optimistic cache updates so new posts appear instantly without waiting for full refetch (was causing delays)
2. **Follow/Unfollow Responsiveness** - Follow button state and count updates are instant
3. **Follower List Navigation** - Made followers/following lists clickable to access user profiles
4. **Real User Data** - Suggested Creators now fetch real data from database instead of mock data

**User Experience Fixes:**
5. **Follow State Persistence** - When you follow someone, the button correctly stays as "Following" instead of toggling back
6. **Count Synchronization** - Both your following count and the target user's follower count update together
7. **Unfollow Counts** - Following counts properly decrease when unfollowing

## User Preferences

- Preferred communication style: Simple, everyday language
- Strict requirements: NO emojis anywhere - use Lucide icons only
- Data persistence: All data must persist permanently (PostgreSQL database)
- Mobile-first design: 430px width minimum
- Authentication: Email/password AND Google Sign-In/Sign-Up both required

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI
- Vite as the build tool and development server
- TanStack React Query for server state management with optimistic updates
- Tailwind CSS for styling with custom design system
- shadcn/ui component library (Radix UI primitives)

**Design System:**
- Typography: Inter (primary), DM Sans (accents)
- Dark-first theme with custom color tokens
- Mobile-first responsive layout
- Spacing based on Tailwind's 4px grid system

**Key UI Patterns:**
- Bottom navigation bar for primary app sections (Home, Explore, Create, Notifications, Profile)
- Modal-based flows for post creation, comments, settings, and profile editing
- Pull-to-refresh mechanism for feed updates
- Infinite scroll with loading states
- Collapsible headers for improved content focus

**State Management:**
- React Query for API data fetching and caching with optimistic updates
- Local state with useState/useReducer for UI interactions
- localStorage for persisting user session data
- Context-free architecture relying on prop drilling for simplicity

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js
- TypeScript for type safety
- ESM module system

**Storage Strategy:**
- Dual storage implementation: in-memory (`MemStorage`) and database (`DbStorage`)
- Interface-based storage abstraction (`IStorage`) allows swapping implementations
- In-memory storage used for development/demo with seed data
- Database storage ready for production deployment

**API Design:**
- RESTful endpoints under `/api/*` namespace
- JSON request/response format
- Request logging middleware
- 50MB payload limit for media uploads

**Authentication:**
- Firebase Authentication for user signup/login
- Email/password authentication flow
- Session-based authentication patterns
- Username availability checking

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- Schema-first design with TypeScript inference

**Schema Structure:**

*Users Table:*
- Profile data (username, displayName, bio, location, profession)
- Media (avatar, banner)
- Social metrics (followerCount, followingCount, postCount)

*Posts Table:*
- Content (image, caption, category)
- Engagement metrics (likes, commentCount)
- Genre categorization (Fashion, Music, Art, Culture, Lifestyle)

*Social Interactions:*
- Comments with threading support (parentCommentId for replies)
- Likes for both posts and comments
- Follow relationships between users

*Platform Features:*
- Creator badges for verified/featured users
- Notifications system (in-app and push)
- User settings for privacy and preferences

**File Storage:**
- Base64 encoding for image data in development
- Prepared for external storage service integration (S3, Cloudinary)

### External Dependencies

**Firebase Services:**
- Firebase Authentication for user management
- Firebase Cloud Messaging (FCM) for push notifications
- Firebase Admin SDK for server-side operations
- Note: Push notifications are optional; app functions without Firebase Admin configured

**UI Component Libraries:**
- Radix UI for accessible, unstyled primitives
- Embla Carousel for media galleries
- React Hook Form with Zod for form validation
- date-fns for date formatting
- class-variance-authority (CVA) for component variants

**Development Tools:**
- Drizzle Kit for database migrations
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Replit-specific plugins for development experience

**Design Assets:**
- Generated images stored in `attached_assets` directory
- Google Fonts (DM Sans, Geist Mono, Architects Daughter, Fira Code)

**Notable Architecture Decisions:**

1. **Optimistic Cache Updates**: Posts appear instantly when created by adding them to React Query cache before server confirmation, improving perceived performance significantly.

2. **Dual Storage Pattern**: Maintains both in-memory and database implementations to support rapid development with seed data while being production-ready. This allows developers to work without database dependencies initially.

3. **Optional Firebase Admin**: Push notifications are implemented as an optional feature. The app gracefully degrades when Firebase Admin credentials aren't configured, maintaining core functionality.

4. **Admin System**: Separate admin authentication flow with comprehensive dashboard for content moderation, user management, and system monitoring. Access controlled via hardcoded credentials for owner/admin roles.

5. **Genre-Based Content Discovery**: Posts categorized into predefined genres (Fashion, Music, Art, Culture, Lifestyle) with associated metadata (icons, colors, tags) for enhanced content discovery.

6. **Mobile-First PWA Design**: Optimized for mobile viewport with fixed bottom navigation, pull-to-refresh, and touch-friendly interactions while maintaining desktop compatibility.

7. **Real-time Social Updates**: Following counts, follower displays, and button states update immediately on the client side, providing instant user feedback without waiting for database confirmation.

## Ready for Deployment

The application is fully functional and optimized for production deployment. All core features are working smoothly with performance enhancements in place.
