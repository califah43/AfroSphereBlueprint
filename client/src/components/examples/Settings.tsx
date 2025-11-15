import Settings from "../Settings";

export default function SettingsExample() {
  return (
    <Settings
      onClose={() => console.log("Close settings")}
      onLogout={() => console.log("Logout")}
    />
  );
}
