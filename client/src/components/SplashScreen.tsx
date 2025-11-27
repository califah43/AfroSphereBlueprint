import { useEffect } from "react";
import splashLogo from "@assets/generated_images/transparent_outlined_african_continent_logo.png";

interface SplashScreenProps {
  onComplete: () => void;
  onLogoClick?: () => void;
}

export default function SplashScreen({ onComplete, onLogoClick }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-950 via-purple-900 to-black flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white" data-testid="text-splash-tagline">
        AfroSphere
      </h1>
      <p className="text-lg text-purple-200 mt-3">Africa's Creative Home</p>
    </div>
  );
}
