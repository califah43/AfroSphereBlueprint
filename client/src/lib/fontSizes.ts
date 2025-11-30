/**
 * APP FONT SCALE — AfroSphere Typography System
 * Use these values across all screens for consistent premium UI.
 * 
 * Can be used in two ways:
 * 1. Tailwind classes via Tailwind config
 * 2. Inline styles: <div style={{ fontSize: FontSizes.bodyM }}>Text</div>
 * 3. CSS: font-size: var(--font-size-body-m)
 */

export const FontSizes = {
  displayXL: 34,     // For app branding, splash screen, major titles
  displayL: 30,      // Section titles or premium headers

  h1: 26,            // Main page headings
  h2: 22,            // Sub-headings
  h3: 20,            // Feed section titles
  h4: 18,            // Profile labels, secondary headings

  bodyL: 17,         // Rich-text body
  bodyM: 16,         // Default body text (use this most)
  bodyS: 15,         // Slightly smaller text

  captionM: 14,      // Timestamp, small UI text
  captionS: 12,      // Metadata text

  label: 11          // Tiny UI labels, tags, badges text
} as const;

// Type-safe font size selector
export type FontSizeKey = keyof typeof FontSizes;

// Helper function to get font size with default
export const getFontSize = (size: FontSizeKey, fallback: number = FontSizes.bodyM): number => {
  return FontSizes[size] ?? fallback;
};

// For use with Tailwind text utilities (if configured)
// Example in tailwind.config: text-display-xl, text-h1, text-body-m, etc.
export const fontSizeMap = Object.entries(FontSizes).reduce((acc, [key, value]) => {
  acc[key as FontSizeKey] = `${value}px`;
  return acc;
}, {} as Record<FontSizeKey, string>);
