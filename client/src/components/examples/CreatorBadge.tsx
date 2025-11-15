import CreatorBadge from "../CreatorBadge";

export default function CreatorBadgeExample() {
  return (
    <div className="bg-background p-8 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Small Size</h3>
        <div className="flex flex-wrap gap-2">
          <CreatorBadge type="early-creator" size="sm" />
          <CreatorBadge type="top-artist" size="sm" />
          <CreatorBadge type="fashion-vanguard" size="sm" />
          <CreatorBadge type="music-star" size="sm" />
          <CreatorBadge type="cultural-icon" size="sm" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Medium Size</h3>
        <div className="flex flex-wrap gap-2">
          <CreatorBadge type="early-creator" />
          <CreatorBadge type="top-artist" />
          <CreatorBadge type="fashion-vanguard" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Large Size</h3>
        <div className="flex flex-wrap gap-2">
          <CreatorBadge type="music-star" size="lg" />
          <CreatorBadge type="cultural-icon" size="lg" />
        </div>
      </div>
    </div>
  );
}
