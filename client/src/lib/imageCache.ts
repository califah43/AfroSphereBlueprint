// Simple image caching utility to prevent re-fetching on navigation
const imageCache = new Map<string, string>();

export function getCachedImage(url: string): string | undefined {
  return imageCache.get(url);
}

export function setCachedImage(url: string, data: string): void {
  imageCache.set(url, data);
}

export function preloadImage(url: string): void {
  if (!url || imageCache.has(url)) return;
  // Image is already a data URL or external URL, just mark it as cached
  setCachedImage(url, url);
}

export function clearImageCache(): void {
  imageCache.clear();
}
