import { useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  onLogoClick?: () => void;
}

export default function SplashScreen({ onComplete, onLogoClick }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-950 via-purple-900 to-black flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-white" data-testid="text-splash-tagline">
        Africa's Creative Home
      </h1>
    </div>
  );
}
