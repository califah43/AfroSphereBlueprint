# AfroSphere Design Guidelines

## Design Approach

**Reference-Based:** Instagram's content presentation + TikTok's engaging mechanics + Pinterest's discovery, elevated with African cultural celebration.

**Core Principles:**
- Content reigns supreme
- Cultural patterns as accents, not clutter
- Premium creator celebration
- Warm, welcoming dark theme

---

## Color Palette

**Primary Colors:**
- Gold/Amber: #D4AF37 (accents, highlights, active states)
- Warm Orange: #E67E22 (CTA buttons, notifications)
- Deep Crimson: #C0392B (likes, favorites, alerts)
- Terracotta: #CD7F32 (badges, secondary accents)

**Backgrounds:**
- Primary: #1C1814 (dark charcoal with warm undertone)
- Secondary: #2A2420 (cards, elevated surfaces)
- Tertiary: #332B24 (modals, overlays)

**Functional:**
- Success: #27AE60 (warm green)
- Text Primary: #F5F5F5 (off-white)
- Text Secondary: #B8B0A8 (warm gray)
- Borders: #3F362D (warm charcoal)

---

## Typography

**Fonts:** Inter (body), DM Sans (headings)

**Scale:**
- H1: 28px/bold (screen titles)
- H2: 20px/semibold (usernames, sections)
- Body: 14px/regular (captions, content)
- Small: 12px/regular (timestamps, counts)
- Button: 15px/medium

---

## Layout System

**Spacing:** Tailwind units 2, 3, 4, 6, 8, 12, 16, 24

**Containers:**
- Screen padding: px-4 py-6
- Card padding: p-4
- Component gaps: gap-3, gap-4
- Section breaks: mt-8, mb-12

**Grids:**
- Feed: Single column
- Explore: grid-cols-2 (gap-2)
- Profile: grid-cols-3 (gap-1)

---

## Cultural Elements

**Kente-Inspired Patterns:**
- Subtle geometric borders on premium badges
- Profile banner accent strips (horizontal bands, 4px height, gold/crimson/terracotta)
- Creator tier indicators: Bronze → Silver → Gold badges with traditional geometric frames

**Pattern Usage:**
- Profile headers: Thin accent line with repeating diamond motif
- Premium badges: Circular frames with triangular edge details
- Section dividers: Subtle woven pattern (10% opacity)
- Loading states: Animated kente stripe pattern

**Application:**
- Use sparingly as accents, never overwhelming content
- Always at reduced opacity (10-20%) in backgrounds
- Full opacity only on badges and deliberate decorative elements

---

## Component Library

### Bottom Navigation
- 5 icons (24px): Home, Explore, Create (center, elevated circle), Notifications, Profile
- Active: Gold glow effect
- Background: #2A2420 with 80% backdrop blur
- Create button: Gradient (gold → orange), shadow-lg

### Feed Cards
- User header: Avatar (40px, gold ring for verified) + Username + Time + Menu
- Media: Full-width, 4:5 ratio, rounded-xl
- Caption: 3 lines, expandable
- Actions: Like (crimson), Comment, Share, Bookmark
- Card background: #2A2420, rounded-2xl, subtle border (#3F362D)
- Engagement bar: Warm gray text, gold highlights for interaction

### Profile Header
- Banner: 180px, gradient overlay (charcoal → transparent)
- Kente accent strip: 3 horizontal bands below banner (gold/crimson/terracotta, 3px each)
- Avatar: 88px, gold border (3px), overlapping banner
- Creator badge: Premium users get geometric-framed badge (terracotta circle with triangle accents)
- Stats: Followers/Following in grid, warm orange numbers
- Bio: 2 lines max, warm gray text
- Edit button: Outlined gold, full-width

### Explore Discovery
- Search: Rounded-full, #2A2420 background, gold focus ring
- Trending creators: Horizontal scroll, 72px avatars with gold rings
- Category cards: Image + gradient overlay (charcoal 60%) + title (20px, gold)
- Masonry grid: Staggered posts, gap-2

### Comments Interface
- Sticky header: Post thumbnail + caption
- Bubbles: #2A2420 background, rounded-2xl
- Avatar: 32px, left-aligned
- Like icon: Small crimson heart (right side)
- Input: Fixed bottom, rounded-full, gold send icon

### Create Post
- Media preview: Top half, rounded-xl
- Upload area: Dashed border (gold), centered icon
- Caption: Multiline textarea, warm gray placeholder
- Category pills: Horizontal scroll, #332B24 background, active: gold
- Hashtag field: # prefix (gold)
- Post button: Full-width gradient (gold → orange), rounded-xl

### Notifications
- List items: Avatar + action text + time
- Post thumbnails: Right-aligned (48px)
- Follow button: Small, gold outlined
- Unread: Subtle gold background (10% opacity)
- Grouping: "Today" / "This Week" headers (warm orange)

---

## Animations

**Micro-interactions:**
- Like: Heart scales (0 → 1.3 → 1), crimson pulse (400ms)
- Button press: Scale 0.98, subtle glow
- Pull-to-refresh: Gold spinner
- Tab switch: Fade (150ms)
- Card appearance: Fade + slide up (200ms, stagger 80ms)

No complex scroll animations.

---

## Images

### Required Visuals:

**Splash Screen:**
AfroSphere logo with kente-pattern frame on warm gradient (#1C1814 → #2A2420)

**Onboarding (3 slides):**
1. Collage: African creators (fashion, music, art) with gold accent overlays
2. Content showcase: Screenshots of posts with kente-inspired borders
3. Community: Vibrant gathering scene with warm lighting

**Feed Content (30+ posts):**
African fashion, traditional art, Afrobeats artists, cultural celebrations, contemporary African lifestyle - all high-quality, vibrant imagery

**Explore Categories (6 hero images):**
Fashion, Music, Visual Art, Food, Traditions, Lifestyle - each with cultural relevance

**Profile Banners (5 defaults):**
Warm gradients with subtle kente patterns: Gold/Orange, Crimson/Terracotta, Earthy tones

**Treatment:** All media rounded-xl, shimmer placeholder (gold), 4:5 (feed), 16:9 (banners), 1:1 (grid)

---

## Accessibility

- Touch targets: 44px minimum
- Focus rings: Gold, visible on all interactive elements
- Labels: Always visible, not placeholder-only
- Contrast: WCAG AA on all text
- ARIA labels: Comprehensive coverage
- Media captions: Supported throughout

---

## Platform Notes

Mobile-first (430px), tablet adapts to 2-column feed, desktop centered (max-w-2xl). Dark warm theme showcases vibrant African content. Cultural patterns enhance, never distract.