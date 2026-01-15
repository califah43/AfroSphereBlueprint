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
  LITERATURE: {
    id: "literature",
    name: "Literature / Stories",
    description: "African literature, poetry, and storytelling",
    emoji: "📚",
    color: "text-amber-600",
    hexColor: "#d97706",
    backgroundColor: "bg-amber-600/10",
    tags: ["#AfricanLiterature", "#Poetry", "#Storytelling", "#BookReview"],
  },
  FILM: {
    id: "film",
    name: "Film & Visual Media",
    description: "Cinema, documentaries, and visual storytelling",
    emoji: "🎬",
    color: "text-red-500",
    hexColor: "#ef4444",
    backgroundColor: "bg-red-500/10",
    tags: ["#Nollywood", "#AfricanCinema", "#Documentary", "#ShortFilm"],
  },
  DESIGN: {
    id: "design",
    name: "Design & Innovation",
    description: "Architecture, UI/UX, and creative innovation",
    emoji: "💡",
    color: "text-cyan-500",
    hexColor: "#06b6d4",
    backgroundColor: "bg-cyan-500/10",
    tags: ["#AfricanDesign", "#Innovation", "#Architecture", "#CreativeTech"],
  },
  HERITAGE: {
    id: "heritage",
    name: "Culture & Heritage",
    description: "Preserving history and cultural legacies",
    emoji: "🏛️",
    color: "text-orange-700",
    hexColor: "#c2410c",
    backgroundColor: "bg-orange-700/10",
    tags: ["#Heritage", "#History", "#Traditional", "#Ancestry"],
  },
  FOOD: {
    id: "food",
    name: "Food & Culinary Arts",
    description: "Tastes of Africa and culinary creativity",
    emoji: "🍲",
    color: "text-yellow-600",
    hexColor: "#ca8a04",
    backgroundColor: "bg-yellow-600/10",
    tags: ["#AfricanFood", "#CulinaryArts", "#Recipes", "#ChefLife"],
  },
  EDUCATION: {
    id: "education",
    name: "Education & Knowledge",
    description: "Learning, teaching, and knowledge sharing",
    id: "education",
    emoji: "🎓",
    color: "text-emerald-600",
    hexColor: "#059669",
    backgroundColor: "bg-emerald-600/10",
    tags: ["#Education", "#Knowledge", "#Learning", "#AfricanHistory"],
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
