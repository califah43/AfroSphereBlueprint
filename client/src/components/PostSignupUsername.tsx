import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PostSignupUsernameProps {
  onComplete: (username: string) => void;
}

const AFRICAN_USERNAMES = [
  "AmaZulu", "Ashanti", "Zulu", "Mandela", "Nile", "Serengeti", "Ubuntu", 
  "Kente", "Adeyemi", "Kofi", "Amara", "Zainab", "Kwame", "Adanna"
];

export default function PostSignupUsername({ onComplete }: PostSignupUsernameProps) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!username.trim()) {
      toast({ title: "Enter a username", variant: "destructive" });
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch(`/api/auth/check-username/${username}`);
      const data = await res.json();
      setIsAvailable(data.available);
      
      if (!data.available) {
        toast({ title: "Username taken", description: "Try another one", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error checking username", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSuggest = () => {
    const random = AFRICAN_USERNAMES[Math.floor(Math.random() * AFRICAN_USERNAMES.length)];
    const withNumber = `${random}${Math.floor(Math.random() * 999)}`;
    setUsername(withNumber);
    setIsAvailable(null);
  };

  const handleContinue = () => {
    if (isAvailable) {
      onComplete(username);
    } else {
      toast({ title: "Verify username first", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div className="h-full w-1/3 bg-gradient-to-r from-primary to-orange-500" />
      </div>

      {/* Header */}
      <div className="px-4 py-4 border-b border-border/50">
        <p className="text-xs text-muted-foreground">Step 1 of 3</p>
        <h1 className="text-2xl font-black tracking-tight mt-1">Choose Your Handle</h1>
        <p className="text-sm text-muted-foreground mt-2">Your unique @username on AfroSphere</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Input Section */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-foreground">USERNAME</label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  setIsAvailable(null);
                }}
                placeholder="yourname"
                className="pl-7 h-9 text-sm"
                data-testid="input-username"
              />
            </div>
            {isAvailable === true && (
              <p className="text-xs text-green-500 mt-1">✓ Available!</p>
            )}
            {isAvailable === false && (
              <p className="text-xs text-destructive mt-1">✗ Taken</p>
            )}
          </div>

          <Button
            onClick={handleCheck}
            disabled={!username.trim() || isChecking}
            className="w-full h-9 bg-primary hover:bg-primary/90 text-white font-bold text-sm"
            data-testid="button-check-username"
          >
            {isChecking ? "Checking..." : "Check Available"}
          </Button>
        </div>

        {/* Suggestion Section */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
          <p className="text-xs font-black uppercase tracking-wider">Need inspiration?</p>
          <p className="text-sm text-muted-foreground">Get a random African-inspired suggestion</p>
          <Button
            onClick={handleSuggest}
            variant="outline"
            className="w-full h-9"
            data-testid="button-suggest-username"
          >
            Get Suggestion
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/50">
        <Button
          onClick={handleContinue}
          disabled={!isAvailable}
          className="w-full h-10 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold disabled:opacity-50"
          data-testid="button-continue-username"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
