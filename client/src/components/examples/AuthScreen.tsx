import AuthScreen from "../AuthScreen";

export default function AuthScreenExample() {
  return <AuthScreen onAuthComplete={() => console.log("Auth complete")} />;
}
