import CreatePost from "../CreatePost";

export default function CreatePostExample() {
  return (
    <CreatePost
      onClose={() => console.log("Close create")}
      onPost={(data) => console.log("Post data:", data)}
    />
  );
}
