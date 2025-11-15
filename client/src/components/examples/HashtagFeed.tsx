import HashtagFeed from "../HashtagFeed";

export default function HashtagFeedExample() {
  return (
    <HashtagFeed
      hashtag="AfricanFashion"
      onClose={() => console.log("Close hashtag feed")}
    />
  );
}
