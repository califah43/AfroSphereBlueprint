import PostDetail from "../PostDetail";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

export default function PostDetailExample() {
  const mockComments = [
    {
      id: "1",
      author: "zara_style",
      text: "This is absolutely stunning! 🔥",
      likes: 23,
      timeAgo: "1h ago",
    },
    {
      id: "2",
      author: "kwame_creative",
      text: "Love the fusion of traditional and modern!",
      likes: 15,
      timeAgo: "45m ago",
    },
  ];

  return (
    <PostDetail
      postId="1"
      author={{ username: "adikeafrica" }}
      imageUrl={fashionImage}
      caption="Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥 #AfricanFashion #Style"
      likes={1247}
      timeAgo="2h ago"
      comments={mockComments}
      onClose={() => console.log("Close post detail")}
    />
  );
}
