import FollowersList from "../FollowersList";

export default function FollowersListExample() {
  return (
    <FollowersList
      username="adikeafrica"
      followerCount="1.2K"
      followingCount="485"
      onClose={() => console.log("Close followers list")}
    />
  );
}
