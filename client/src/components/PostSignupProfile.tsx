import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface PostSignupProfileProps {
  username: string;
  onComplete: (data: { avatar: string; banner: string; bio: string; profession: string }) => void;
}

export default function PostSignupProfile({ username, onComplete }: PostSignupProfileProps) {
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [bioCount, setBioCount] = useState(0);
  const { toast } = useToast();

  const professions = [
    "Content Creator",
    "Artist",
    "Musician",
    "Photographer",
    "Fashion Designer",
    "Writer",
    "Filmmaker",
    "DJ",
    "Producer",
    "Dancer",
    "Other",
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
        toast({ title: "Profile photo added", duration: 2000 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBanner(event.target?.result as string);
        toast({ title: "Banner added", duration: 2000 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setBio(value);
      setBioCount(value.length);
    }
  };

  const handleContinue = () => {
    onComplete({ avatar, banner, bio, profession });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div className="h-full w-2/3 bg-gradient-to-r from-primary to-orange-500" />
      </div>

      {/* Header */}
      <div className="px-4 py-4 border-b border-border/50">
        <p className="text-xs text-muted-foreground">Step 2 of 3</p>
        <h1 className="text-2xl font-black tracking-tight mt-1">Build Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-2">Make it uniquely yours</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Banner Upload */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-foreground">Banner</label>
          <div className="mt-2 relative h-24 bg-muted rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover-elevate overflow-hidden">
            {banner ? (
              <img src={banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Camera className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Add a banner</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              data-testid="input-banner-signup"
            />
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-foreground">Profile Photo</label>
          <div className="mt-2 relative h-24 w-24 bg-muted rounded-full border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover-elevate overflow-hidden mx-auto">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="text-center">
                <Camera className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              data-testid="input-avatar-signup"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-foreground">Bio</label>
          <Textarea
            value={bio}
            onChange={handleBioChange}
            placeholder="Tell your story..."
            className="mt-2 h-20 text-sm resize-none"
            data-testid="textarea-bio-signup"
          />
          <p className="text-xs text-muted-foreground mt-1">{bioCount}/150</p>
        </div>

        {/* Profession */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-foreground">What do you do?</label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {professions.map((prof) => (
              <Button
                key={prof}
                onClick={() => setProfession(prof)}
                variant={profession === prof ? "default" : "outline"}
                className={`h-9 text-xs font-semibold ${
                  profession === prof ? "bg-primary" : ""
                }`}
                data-testid={`button-profession-${prof.toLowerCase().replace(" ", "-")}`}
              >
                {prof}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border/50 bg-card/50 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 h-10"
          data-testid="button-skip-profile"
          onClick={() => onComplete({ avatar, banner, bio, profession })}
        >
          Skip
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 h-10 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold"
          data-testid="button-continue-profile"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
