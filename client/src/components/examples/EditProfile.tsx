import EditProfile from "../EditProfile";

export default function EditProfileExample() {
  return (
    <EditProfile
      onClose={() => console.log("Close edit")}
      onSave={(data) => console.log("Save:", data)}
    />
  );
}
