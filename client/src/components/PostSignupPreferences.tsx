import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Music, Shirt, Palette, Film, Footprints, Camera, Laugh, Zap, Trophy, Plane, UtensilsCrossed, Heart } from "lucide-react";

interface PostSignupPreferencesProps {
  onComplete: (interests: string[]) => void;
}

const INTEREST_CATEGORIES = [
  { id: "music", label: "Music", icon: Music },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "art", label: "Art & Design", icon: Palette },
  { id: "film", label: "Film & Video", icon: Film },
  { id: "dance", label: "Dance", icon: Footprints },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "comedy", label: "Comedy", icon: Laugh },
  { id: "tech", label: "Tech & Innovation", icon: Zap },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "food", label: "Food & Cooking", icon: UtensilsCrossed },
  { id: "wellness", label: "Wellness", icon: Heart },
];

export default function PostSignupPreferences({ onComplete }: PostSignupPreferencesProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id].slice(-5)
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      toast({ title: "Select at least one interest", variant: "destructive" });
      return;
    }
    onComplete(selected);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div className="h-full w-full bg-gradient-to-r from-primary to-orange-500" />
      </div>

      {/* Header */}
      <div className="px-4 py-4 border-b border-border/50">
        <p className="text-xs text-muted-foreground">Step 3 of 3</p>
        <h1 className="text-2xl font-black tracking-tight mt-1">Your Interests</h1>
        <p className="text-sm text-muted-foreground mt-2">Pick up to 5 to personalize your feed</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {INTEREST_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
            <button
              key={category.id}
              onClick={() => toggleInterest(category.id)}
              className={`p-4 rounded-lg border-2 transition-all h-24 flex flex-col items-center justify-center gap-2 hover-elevate ${
                selected.includes(category.id)
                  ? "border-primary bg-primary/10"
                  : "border-border/30 bg-card/50"
              }`}
              data-testid={`button-interest-${category.id}`}
            >
              <IconComponent className={`w-6 h-6 ${
                selected.includes(category.id) ? "text-primary" : "text-muted-foreground"
              }`} />
              <span className={`text-xs font-semibold ${
                selected.includes(category.id) ? "text-primary" : "text-foreground"
              }`}>
                {category.label}
              </span>
            </button>
          );
          })}
        </div>

        {/* Selection Count */}
        <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            {selected.length === 0 ? "Select interests" : `${selected.length}/5 selected`}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/50">
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full h-10 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold disabled:opacity-50"
          data-testid="button-continue-preferences"
        >
          Let's Go to AfroSphere
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">You can change this anytime in Settings</p>
      </div>
    </div>
  );
}
