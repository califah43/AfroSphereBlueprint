import Comments from "../Comments";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

export default function CommentsExample() {
  return (
    <Comments
      postId="1"
      postImage={fashionImage}
      postCaption="Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥"
      onClose={() => console.log("Close comments")}
    />
  );
}
