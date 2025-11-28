// Extract hashtags from text
export function extractHashtags(text: string): string[] {
  const regex = /#[\w]+/g;
  const matches = text.match(regex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
}

// Parse caption to find mentions and hashtags
export function parseCaption(caption: string): { text: string; hashtags: string[]; mentions: string[] } {
  const hashtags = extractHashtags(caption);
  const mentions = caption.match(/@[\w]+/g)?.map(m => m.substring(1).toLowerCase()) || [];
  return { text: caption, hashtags: [...new Set(hashtags)], mentions: [...new Set(mentions)] };
}
