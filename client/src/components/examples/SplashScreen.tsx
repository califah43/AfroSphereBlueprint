import SplashScreen from "../SplashScreen";

export default function SplashScreenExample() {
  return <SplashScreen onComplete={() => console.log("Splash complete")} />;
}
