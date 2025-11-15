import PostCard from "../PostCard";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

export default function PostCardExample() {
  const mockPost = {
    id: "1",
    author: {
      username: "adikeafrica",
      avatar: undefined,
    },
    imageUrl: fashionImage,
    caption: "Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥 #AfricanFashion #Style",
    likes: 1247,
    comments: 89,
    timeAgo: "2h ago",
  };

  return (
    <div className="max-w-md mx-auto bg-background p-4">
      <PostCard
        post={mockPost}
        onLike={(id) => console.log("Liked post:", id)}
        onComment={(id) => console.log("Comment on:", id)}
        onShare={(id) => console.log("Share:", id)}
        onBookmark={(id) => console.log("Bookmark:", id)}
      />
    </div>
  );
}
