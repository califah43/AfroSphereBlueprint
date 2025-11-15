import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import creatorsImage from "@assets/generated_images/African_creators_collage_onboarding_e915311d.png";
import communityImage from "@assets/generated_images/Community_gathering_onboarding_slide_1121cea8.png";

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [
  {
    image: creatorsImage,
    title: "Create. Inspire. Belong.",
    subtitle: "Join a vibrant community of African creators sharing their art, fashion, music, and culture.",
  },
  {
    image: communityImage,
    title: "Your culture. Your voice.",
    subtitle: "Express yourself authentically and connect with creators across the continent and diaspora.",
  },
  {
    image: creatorsImage,
    title: "Join the movement.",
    subtitle: "Be part of Africa's creative renaissance. Share your story, inspire others, grow together.",
  },
];

export default function OnboardingSlides({ onComplete, onSkip }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-64 object-cover rounded-lg mb-8"
            data-testid={`img-onboarding-slide-${currentSlide}`}
          />
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-onboarding-title">
            {slides[currentSlide].title}
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-8" data-testid="text-onboarding-subtitle">
            {slides[currentSlide].subtitle}
          </p>
        </div>
      </div>

      <div className="p-6 pb-8">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
              data-testid={`indicator-slide-${index}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {currentSlide < slides.length - 1 && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="flex-1"
              data-testid="button-skip-onboarding"
            >
              Skip
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
            data-testid="button-next-onboarding"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
