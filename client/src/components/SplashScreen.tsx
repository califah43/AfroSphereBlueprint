import { useEffect } from "react";
import splashLogo from "@assets/generated_images/transparent_outlined_african_continent_logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-950 via-purple-900 to-black flex flex-col items-center justify-center">
      <div className="animate-pulse">
        <img
          src={splashLogo}
          alt="AfroSphere Logo"
          className="w-32 h-32 object-contain"
          data-testid="img-splash-logo"
        />
      </div>
      <h1 className="text-2xl font-bold text-white mt-6" data-testid="text-splash-tagline">
        Africa's Creative Home
      </h1>
    </div>
  );
}
