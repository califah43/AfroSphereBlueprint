import { PostCardSkeleton, StorySkeleton, ProfileSkeleton, GridSkeleton } from "../SkeletonLoader";

export default function SkeletonLoaderExample() {
  return (
    <div className="bg-background space-y-8 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Stories Skeleton</h3>
        <StorySkeleton />
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Post Card Skeleton</h3>
        <div className="max-w-md">
          <PostCardSkeleton />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Grid Skeleton</h3>
        <GridSkeleton count={9} />
      </div>
    </div>
  );
}
