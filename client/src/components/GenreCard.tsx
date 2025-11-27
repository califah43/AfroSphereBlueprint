import { Card } from "@/components/ui/card";
import { GENRES } from "@shared/genres";

interface GenreCardProps {
  genreId: string;
  onClick?: () => void;
  postsCount?: number;
}

export default function GenreCard({ genreId, onClick, postsCount }: GenreCardProps) {
  const genre = GENRES[genreId.toUpperCase()];
  
  if (!genre) return null;

  return (
    <Card
      onClick={onClick}
      className={`p-4 hover-elevate cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all ${genre.backgroundColor}`}
      data-testid={`genre-card-${genre.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{genre.emoji}</span>
        {postsCount && (
          <span className="text-xs bg-muted px-2 py-1 rounded-full">{postsCount}K posts</span>
        )}
      </div>
      <h3 className="font-bold text-sm mb-1">{genre.name}</h3>
      <p className="text-xs text-muted-foreground">{genre.description}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {genre.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-primary/70">
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}
