import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

export type PostCategory = "fashion" | "music" | "art" | "culture" | "lifestyle" | "for-you";

export interface Post {
  id: string;
  author: {
    username: string;
    avatar?: string;
  };
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  category: PostCategory;
}

const images = [fashionImage, artImage, musicImage];

const fashionPosts = [
  { username: "adikeafrica", caption: "Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥 #AfricanFashion", likes: 1247, comments: 89, timeAgo: "2h ago" },
  { username: "zara_style", caption: "New collection: Bold patterns, sustainable fabrics. Shop local, think global 🌍 #EthicalFashion", likes: 892, comments: 54, timeAgo: "5h ago" },
  { username: "kente_vibes", caption: "Traditional kente meets contemporary cuts. The future of African fashion is here 👑 #KenteKing", likes: 1523, comments: 127, timeAgo: "8h ago" },
  { username: "adire_queen", caption: "Indigo dreams and patterns for days. Celebrating the art of Yoruba textiles 💙 #AdireArt", likes: 756, comments: 42, timeAgo: "12h ago" },
  { username: "fashion_naija", caption: "Lagos fashion week recap - the runway was 🔥🔥🔥 #LagosFashionWeek", likes: 2103, comments: 156, timeAgo: "1d ago" },
  { username: "afro_couture", caption: "Sustainable luxury with an African touch. Every piece tells a story 📖✨ #AfrocCouture", likes: 645, comments: 38, timeAgo: "1d ago" },
  { username: "print_addict", caption: "Mixing prints like a boss! Who says African prints clash? They harmonize! 🎨 #PrintMixing", likes: 1834, comments: 92, timeAgo: "2d ago" },
  { username: "dash_fashion", caption: "Dashiki season is forever season. Own your heritage, own your style 👜 #DashikiDiaries", likes: 567, comments: 31, timeAgo: "2d ago" },
  { username: "african_drip", caption: "Street style from Accra. African fashion taking over global runways 🔥 #StreetStyle", likes: 1456, comments: 78, timeAgo: "2d ago" },
  { username: "style_kampala", caption: "Designing with purpose: every collection supports local artisans 🤝 #SocialFashion", likes: 823, comments: 51, timeAgo: "3d ago" },
];

const musicPosts = [
  { username: "amaarabeats", caption: "Late night sessions creating the future of Afrobeats. Studio vibes 🎵 #AfricanMusic #Producer", likes: 2103, comments: 156, timeAgo: "1d ago" },
  { username: "beat_masta", caption: "New track dropping Friday! Afrobeats meets amapiano. Your ears are ready 🎧 #NewMusic", likes: 1678, comments: 94, timeAgo: "5h ago" },
  { username: "koffee_lyricist", caption: "Lyrics from the soul. Writing the soundtrack to African excellence 🎤💯 #Lyrics", likes: 934, comments: 67, timeAgo: "8h ago" },
  { username: "dj_cairo", caption: "Spinning vibes from Cairo to Nairobi. AfroBeats, Amapiano, House - it's all love 🎵🌍 #DJLife", likes: 1245, comments: 83, timeAgo: "12h ago" },
  { username: "prod_genius", caption: "Beat of the day: Blending traditional African instruments with modern production 🥁🎹 #Production", likes: 876, comments: 52, timeAgo: "1d ago" },
  { username: "afro_rapper", caption: "Spitting fire in 5 languages. Hip-hop is universal, culture is local 🔥🎙️ #HipHop", likes: 1567, comments: 98, timeAgo: "1d ago" },
  { username: "vocal_heaven", caption: "Vocal training session preparing for the continental tour! 🎤✨ #VocalCoach", likes: 743, comments: 44, timeAgo: "2d ago" },
  { username: "jazz_collective", caption: "Reimagining jazz through African perspectives. Soul music revolution 🎷💭 #JazzFusion", likes: 892, comments: 61, timeAgo: "2d ago" },
  { username: "gospel_vibes", caption: "Sunday choir session hitting different 🙏🎵 #GospelMusic", likes: 1023, comments: 73, timeAgo: "2d ago" },
  { username: "musician_life", caption: "From concept to platinum record. The journey of an African artist documented 📸🎵 #MusicProduction", likes: 1456, comments: 87, timeAgo: "3d ago" },
];

const artPosts = [
  { username: "kojoart", caption: "New piece inspired by Adinkra symbols. The journey continues. #AfricanArt #ContemporaryArt", likes: 892, comments: 54, timeAgo: "5h ago" },
  { username: "paint_mastery", caption: "Oil on canvas: A tribute to our ancestors. Art is resistance, art is love 🎨 #Painting", likes: 1123, comments: 76, timeAgo: "8h ago" },
  { username: "sculpture_queen", caption: "Stone carving workshop. Traditional techniques, modern vision 🪨✨ #Sculpture", likes: 678, comments: 42, timeAgo: "12h ago" },
  { username: "digital_artist", caption: "Digital art meets traditional storytelling. NFTs supporting African artists 💻🎨 #DigitalArt", likes: 1456, comments: 94, timeAgo: "1d ago" },
  { username: "ceramic_craft", caption: "Pottery wheel sessions at the studio. Every pot has a soul 🏺 #Ceramics", likes: 834, comments: 58, timeAgo: "1d ago" },
  { username: "textile_weaver", caption: "Handwoven masterpieces using ancestral techniques. 72 hours, 1 tapestry 🧵✨ #TextileArt", likes: 956, comments: 67, timeAgo: "1d ago" },
  { username: "street_artist", caption: "Murals transforming our communities. Art that speaks truth to power 🖌️ #StreetArt", likes: 1734, comments: 102, timeAgo: "2d ago" },
  { username: "illustration_lab", caption: "Character design inspired by African folklore. Every line has meaning 🖍️ #Illustration", likes: 745, comments: 51, timeAgo: "2d ago" },
  { username: "mixed_media", caption: "Collage series: African identity in fragments and wholes 🎨📰 #MixedMedia", likes: 892, comments: 63, timeAgo: "2d ago" },
  { username: "exhibition_ready", caption: "My first gallery show opens next month! Nervous but grateful 🖼️💫 #ArtExhibition", likes: 1567, comments: 109, timeAgo: "3d ago" },
];

const culturePosts = [
  { username: "culture_keeper", caption: "Ancient traditions in modern times. Keep your culture alive, pass it on 🌍 #CulturalHeritage", likes: 1234, comments: 87, timeAgo: "6h ago" },
  { username: "griot_stories", caption: "Storytelling night: Tales passed down for generations 📖✨ #OralTradition", likes: 876, comments: 62, timeAgo: "10h ago" },
  { username: "ritual_documentarian", caption: "Documenting our ceremonies. Every ritual is a rebellion against erasure 🕯️ #CulturalMemory", likes: 1023, comments: 71, timeAgo: "1d ago" },
  { username: "language_pride", caption: "Learning and teaching my grandmother's language. Lost languages = lost worlds 🗣️ #LanguagePreservation", likes: 945, comments: 58, timeAgo: "1d ago" },
  { username: "festival_vibe", caption: "Annual cultural festival in full swing! Unity, music, joy 🎉🌍 #CulturalFestival", likes: 1678, comments: 94, timeAgo: "1d ago" },
  { username: "ancestral_wisdom", caption: "The elders speak. Listen. Learn. Become. 🌳👴 #WisdomKeepers", likes: 734, comments: 49, timeAgo: "2d ago" },
  { username: "ceremony_sacred", caption: "Traditional coming-of-age ceremony. Honoring what came before 👑🔥 #Initiation", likes: 1456, comments: 96, timeAgo: "2d ago" },
  { username: "heritage_hub", caption: "Museum of African culture opens! Our stories, our space, our power 🏛️ #AfricanHeritage", likes: 2134, comments: 143, timeAgo: "2d ago" },
  { username: "roots_deep", caption: "Genealogy journey: I found where my family comes from 🗺️😭 #RootsSearch", likes: 1789, comments: 118, timeAgo: "2d ago" },
  { username: "ubuntu_collective", caption: "'I am because we are' - Living ubuntu philosophy daily. Community > individual 🤝 #Ubuntu", likes: 1245, comments: 83, timeAgo: "3d ago" },
];

const lifestylePosts = [
  { username: "wellness_guru", caption: "Morning meditation overlooking the continent. Inner peace = outer glow ✨🧘 #MindfulLiving", likes: 987, comments: 62, timeAgo: "7h ago" },
  { username: "kitchen_diaries", caption: "Traditional recipes with a modern twist. Food is culture on a plate 🍲❤️ #AfricanCuisine", likes: 1456, comments: 89, timeAgo: "10h ago" },
  { username: "travel_nomad", caption: "Backpacking through 5 African countries. The continent is calling 🗺️✈️ #AfricaTravel", likes: 1834, comments: 127, timeAgo: "1d ago" },
  { username: "fitness_champion", caption: "Training like our ancestors. Strength, speed, stamina 💪🔥 #FitnessJourney", likes: 1123, comments: 71, timeAgo: "1d ago" },
  { username: "eco_warrior", caption: "Living zero-waste on the continent. Sustainability starts at home 🌱♻️ #EcoLiving", likes: 945, comments: 58, timeAgo: "1d ago" },
  { username: "beauty_glow", caption: "Natural beauty routines using African ingredients. What mama taught us works! 💄🌿 #NaturalBeauty", likes: 1678, comments: 94, timeAgo: "2d ago" },
  { username: "book_lover", caption: "Reading African authors who are changing the narrative 📚💯 #AfricanAuthors", likes: 834, comments: 51, timeAgo: "2d ago" },
  { username: "homebody_bliss", caption: "Decorating my space with African art and vibes. Home is where the soul rests 🏠🎨 #HomeDecor", likes: 756, comments: 45, timeAgo: "2d ago" },
  { username: "learning_daily", caption: "Online course on African entrepreneurship. Knowledge = power 📚💼 #SelfImprovement", likes: 1245, comments: 76, timeAgo: "2d ago" },
  { username: "sunday_goals", caption: "Planning next week to dominate. Organization is a superpower 📋✨ #ProductivityTips", likes: 892, comments: 59, timeAgo: "3d ago" },
];

function createPost(
  id: string,
  author: string,
  caption: string,
  likes: number,
  comments: number,
  timeAgo: string,
  category: PostCategory,
  imageIndex: number = 0
): Post {
  return {
    id,
    author: { username: author },
    imageUrl: images[imageIndex % images.length],
    caption,
    likes,
    comments,
    timeAgo,
    category,
  };
}

let postId = 1;

export const mockPosts: Post[] = [
  ...fashionPosts.map((p) =>
    createPost(String(postId++), p.username, p.caption, p.likes, p.comments, p.timeAgo, "fashion", postId % 3)
  ),
  ...musicPosts.map((p) =>
    createPost(String(postId++), p.username, p.caption, p.likes, p.comments, p.timeAgo, "music", postId % 3)
  ),
  ...artPosts.map((p) =>
    createPost(String(postId++), p.username, p.caption, p.likes, p.comments, p.timeAgo, "art", postId % 3)
  ),
  ...culturePosts.map((p) =>
    createPost(String(postId++), p.username, p.caption, p.likes, p.comments, p.timeAgo, "culture", postId % 3)
  ),
  ...lifestylePosts.map((p) =>
    createPost(String(postId++), p.username, p.caption, p.likes, p.comments, p.timeAgo, "lifestyle", postId % 3)
  ),
];
