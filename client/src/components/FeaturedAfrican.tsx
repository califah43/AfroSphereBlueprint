import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame } from "lucide-react";
import fashionImage from "@assets/generated_images/Fashion_category_hero_image_37046966.png";

interface FeaturedCreator {
  username: string;
  category: string;
  description: string;
  image: string;
  isHot?: boolean;
}

interface FeaturedAfricanProps {
  onCreatorClick?: (username: string) => void;
}

const featuredCreators: FeaturedCreator[] = [
  {
    username: "adikeafrica",
    category: "Fashion",
    description: "Celebrating Ankara fusion with modern elegance",
    image: fashionImage,
    isHot: true,
  },
];

export default function FeaturedAfrican({ onCreatorClick }: FeaturedAfricanProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-6" data-testid="container-featured-african">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Featured African Creators</h2>
      </div>

      <div className="space-y-3">
        {featuredCreators.map((creator) => (
          <Card
            key={creator.username}
            onClick={() => onCreatorClick?.(creator.username)}
            className="overflow-hidden hover-elevate cursor-pointer border-primary/20"
            data-testid={`featured-${creator.username}`}
          >
            <div className="relative h-32 overflow-hidden">
              <img
                src={creator.image}
                alt={creator.username}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{creator.username}</p>
                  {creator.isHot && (
                    <Badge className="bg-primary text-primary-foreground text-xs h-5 flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      Hot
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/90 mb-1">{creator.category}</p>
                <p className="text-xs text-white/80">{creator.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Celebrating African creativity every day
          <Sparkles className="h-4 w-4 text-primary" />
        </p>
      </div>
    </div>
  );
}
