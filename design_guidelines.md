# AfroSphere Design Guidelines

## Design Approach

**Reference-Based Approach** drawing from Instagram's clean content presentation, TikTok's engaging feed mechanics, and Pinterest's discovery patterns, adapted for African cultural expression.

**Core Principles:**
- Content-first: Let creator work shine
- Cultural vibrancy: Bold, warm, celebratory
- Smooth interactions: Seamless, rewarding
- Dark elegance: Premium feel, content pops

---

## Typography

**Font Families:**
- Primary: Inter (clean, modern readability)
- Accent: DM Sans (headings, usernames)

**Hierarchy:**
- App Title/Logo: 32px, bold
- Screen Headers: 24px, semibold
- Usernames: 15px, semibold
- Captions/Body: 14px, regular
- Timestamps/Meta: 12px, regular
- Buttons: 15px, medium

---

## Layout System

**Spacing Units:** Tailwind 2, 3, 4, 6, 8, 12, 16, 24
- Card padding: p-4
- Screen padding: px-4 py-6
- Component gaps: gap-3, gap-4
- Section spacing: mt-8, mb-12

**Mobile-First Grid:**
- Feed: Single column, full-width cards
- Explore: 2-column grid (md:3-column)
- Profile Posts: 3-column grid

---

## Component Library

### Navigation
**Bottom Tab Bar (Fixed):**
- 5 icons: Home, Explore, Create (centered, elevated), Notifications, Profile
- Active state: vibrant accent glow
- Icons: 24px, stroke-width 2
- Background: Dark with subtle blur

### Feed Cards
**Structure:**
- User header: Avatar (40px) + Username + Time + Menu (3-dot)
- Media: Full-width, 4:5 aspect ratio (Instagram style)
- Caption: Max 3 lines, "see more" expansion
- Action bar: Like, Comment, Share, Bookmark (right-aligned)
- Engagement counts below actions
- Rounded corners: 12px
- Card spacing: gap-4

**Interactions:**
- Double-tap anywhere on image for like
- Heart animation from tap point (scale + fade)
- Like count increments with smooth number transition

### Create Post Screen
**Layout:**
- Media preview: Top half of screen
- Upload zone: Dashed border, icon + "Upload Image/Video"
- Caption: Multi-line textarea, placeholder: "Share your culture..."
- Category pills: Horizontal scroll, rounded-full
- Hashtag input: Separate field with # prefix
- Post button: Bottom, full-width, glowing green gradient

### Comments
**Chat-Style Interface:**
- Post thumbnail + caption at top (sticky)
- Comments: Speech bubble style
- User avatar left (32px)
- Comment text: Dark bubble, 12px radius
- Like heart: Right side of each comment
- Input bar: Fixed bottom, rounded-full, send icon

### Profile Screen
**Header Section:**
- Banner image: 200px height, gradient overlay
- Avatar: 96px, white border, overlapping banner
- Username: 20px, bold
- Bio: 14px, 2-line max
- Stats row: Followers, Following (centered)
- Edit Profile button: Full-width, outlined

**Content Tabs:**
- Posts, Liked, Saved (underline indicator)
- Grid below: 3 columns, square aspect, gap-1

### Explore/Discovery
**Sections:**
- Search bar: Top, rounded-full, dark background
- "Trending Creators": Horizontal scroll, circular avatars (80px) + names
- Category cards: 2-column grid
- Each card: Image + overlay gradient + category name
- "Popular Posts": Pinterest-style masonry grid

### Notifications
**List Items:**
- Avatar (40px) + Action text + Time
- "liked your post" → post thumbnail (right)
- "followed you" → Follow button (right, small)
- Unread: Subtle accent background
- Grouping: "Today", "This Week"

### Onboarding Slides
**Full-Screen Slides:**
- Large visual: Top 60% of screen
- Headline: 28px, bold, centered
- Subtext: 16px, centered, max-width-sm
- Pagination dots: Bottom, 8px circles
- Skip button: Top right, ghost style
- Navigation: Swipe or "Next" button

---

## Animations

**Strategic Use Only:**
- Like heart: Scale 0 → 1.2 → 1, fade in/out (300ms)
- Post upload: Progress bar + success checkmark
- Pull-to-refresh: Subtle spinner
- Tab transitions: Fade (200ms)
- Card entry: Stagger on scroll (100ms delay each)

**NO complex scroll-triggered animations**

---

## Images

### Required Images:

1. **Splash Screen**: AfroSphere logo (glowing effect) on dark gradient background
2. **Onboarding Slide 1**: Collage of diverse African creators (musicians, artists, fashion)
3. **Onboarding Slide 2**: Screenshots of content examples (art, music, fashion)
4. **Onboarding Slide 3**: Community gathering visual
5. **Feed Posts**: 20-40 seed posts showing African fashion, art, music, lifestyle
6. **Explore Categories**: Hero images for Fashion, Music, Visual Art, Culture, Lifestyle sections
7. **Profile Banners**: Default gradient options for users

### Image Treatment:
- Rounded corners: 12px for all media
- Aspect ratios: 4:5 (feed), 16:9 (banners), 1:1 (explore grid)
- Compression: Optimize for mobile
- Placeholder: Gradient shimmer effect while loading

---

## Accessibility

- Touch targets: Minimum 44px
- Icon buttons: Visible focus rings
- Form labels: Always visible (not just placeholders)
- Contrast: WCAG AA minimum
- Captions: Support for media content
- Screen reader: Proper ARIA labels on all interactive elements

---

## Platform Notes

**Mobile-First, Dark Theme Default:**
- Designed for vertical mobile experience
- Tablet: Adapt to 2-column feed
- Desktop: Max-width container (768px) centered
- Dark UI lets content colors pop
- Vibrant accent colors inspired by African textiles and sunsets