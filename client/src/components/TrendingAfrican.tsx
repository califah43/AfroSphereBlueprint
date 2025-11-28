import { Flame, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendingItem {
  hashtag: string;
  count: string;
  trend: "rising" | "hot";
}

const trendingAfrican: TrendingItem[] = [
  { hashtag: "#AfricanFashion", count: "2.3M", trend: "hot" },
  { hashtag: "#AfrobeatsGlobal", count: "1.8M", trend: "hot" },
  { hashtag: "#AfricanArt", count: "956K", trend: "rising" },
  { hashtag: "#PanAfricanism", count: "634K", trend: "rising" },
  { hashtag: "#AfricanCreators", count: "1.2M", trend: "hot" },
];

export default function TrendingAfrican() {
  return (
    <div className="max-w-md mx-auto px-4 py-4" data-testid="container-trending-african">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-primary" />
        Trending Across Africa
      </h3>
      
      <div className="space-y-2">
        {trendingAfrican.map((item, idx) => (
          <div
            key={item.hashtag}
            className="flex items-center justify-between p-2 rounded-lg hover-elevate cursor-pointer bg-muted/50"
            data-testid={`trending-item-${idx}`}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.hashtag}</p>
              <p className="text-xs text-muted-foreground">{item.count} posts</p>
            </div>
            {item.trend === "hot" ? (
              <Badge className="bg-primary text-primary-foreground text-xs flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Hot
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Rising
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
