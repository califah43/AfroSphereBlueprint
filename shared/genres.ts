export interface Genre {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  hexColor: string;
  backgroundColor: string;
  tags: string[];
}

export const GENRES: Record<string, Genre> = {
  FASHION: {
    id: "fashion",
    name: "Fashion",
    description: "African and global fashion, style, and design",
    emoji: "👗",
    color: "text-pink-500",
    hexColor: "#ec4899",
    backgroundColor: "bg-pink-500/10",
    tags: [
      "#AfricanFashion",
      "#Ankara",
      "#AfricanDesigner",
      "#TraditionalWear",
      "#FashionWeek",
      "#StreetStyle",
      "#LuxuryAfrican",
      "#FashionTutorial",
    ],
  },
  MUSIC: {
    id: "music",
    name: "Music",
    description: "Afrobeats, music production, and performances",
    emoji: "🎵",
    color: "text-purple-500",
    hexColor: "#a855f7",
    backgroundColor: "bg-purple-500/10",
    tags: [
      "#Afrobeats",
      "#AfricanMusic",
      "#MusicProducer",
      "#LivePerformance",
      "#NewMusic",
      "#MusicChallenge",
      "#DanceChallenge",
      "#BeatProduction",
    ],
  },
  ART: {
    id: "art",
    name: "Visual Art",
    description: "Paintings, digital art, and creative expressions",
    emoji: "🎨",
    color: "text-orange-500",
    hexColor: "#f97316",
    backgroundColor: "bg-orange-500/10",
    tags: [
      "#AfricanArt",
      "#ContemporaryArt",
      "#AdinkraSymbols",
      "#DigitalArt",
      "#ArtistsOnTwitter",
      "#Sculpture",
      "#Painting",
      "#ArtCommission",
    ],
  },
  CULTURE: {
    id: "culture",
    name: "Culture",
    description: "Heritage, traditions, and cultural celebrations",
    emoji: "🌍",
    color: "text-blue-500",
    hexColor: "#3b82f6",
    backgroundColor: "bg-blue-500/10",
    tags: [
      "#PanAfricanism",
      "#AfricanHeritage",
      "#CulturalPride",
      "#Traditions",
      "#StorytellingCommunity",
      "#CulturalExchange",
      "#AfricanHistory",
      "#Ubuntu",
    ],
  },
  LIFESTYLE: {
    id: "lifestyle",
    name: "Lifestyle",
    description: "Food, travel, wellness, and everyday living",
    emoji: "✨",
    color: "text-green-500",
    hexColor: "#22c55e",
    backgroundColor: "bg-green-500/10",
    tags: [
      "#AfricanFood",
      "#TravelAfrica",
      "#WellnessJourney",
      "#LifestyleBlogger",
      "#AfricanCuisine",
      "#TravelVlog",
      "#HealthyLiving",
      "#DayInMyLife",
    ],
  },
};

export const GENRE_LIST = Object.values(GENRES);

export function getGenreById(id: string): Genre | undefined {
  return GENRES[id.toUpperCase()];
}

export function getGenreByName(name: string): Genre | undefined {
  return GENRE_LIST.find((g) => g.name.toLowerCase() === name.toLowerCase());
}

export function getAllGenreIds(): string[] {
  return GENRE_LIST.map((g) => g.id);
}
