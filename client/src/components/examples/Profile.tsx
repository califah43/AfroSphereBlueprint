import Profile from "../Profile";

export default function ProfileExample() {
  return (
    <Profile
      isOwnProfile={true}
      onEditProfile={() => console.log("Edit profile")}
      onSettings={() => console.log("Settings")}
    />
  );
}
