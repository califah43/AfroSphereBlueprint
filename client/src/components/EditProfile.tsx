import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Camera, MapPin, Link as LinkIcon, Briefcase, Sparkles } from "lucide-react";
import bannerImage from "@assets/generated_images/Sunset_gradient_profile_banner_7206e8a3.png";

interface EditProfileProps {
  onClose: () => void;
  onSave?: (data: any) => void;
}

export default function EditProfile({ onClose, onSave }: EditProfileProps) {
  // Load real user data from localStorage
  const getInitialData = () => {
    const stored = localStorage.getItem("currentUserData");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        return {
          displayName: userData.displayName || userData.username || "Your Name",
          username: userData.username || "username",
          bio: userData.bio || "Creative on AfroSphere",
          location: userData.location || "Your Location",
          website: userData.website || "yourwebsite.com",
          profession: userData.profession || "Creator",
        };
      } catch (e) {
        console.log("Error loading user data");
      }
    }
    return {
      displayName: "Your Name",
      username: "username",
      bio: "Creative on AfroSphere",
      location: "Your Location",
      website: "yourwebsite.com",
      profession: "Creator",
    };
  };

  const [formData, setFormData] = useState(getInitialData());
  const [charCount, setCharCount] = useState(formData.bio.length);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setFormData({ ...formData, bio: value });
      setCharCount(value.length);
    }
  };

  const handleSave = () => {
    const updated = {
      ...JSON.parse(localStorage.getItem("currentUserData") || "{}"),
      displayName: formData.displayName,
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      profession: formData.profession,
    };
    localStorage.setItem("currentUserData", JSON.stringify(updated));
    console.log("Saving profile:", formData);
    onSave?.(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 flex items-center justify-between z-20" style={{ height: "40px" }}>
        <button 
          onClick={onClose} 
          className="flex items-center justify-center"
          data-testid="button-close-edit"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-bold flex items-center gap-1.5" data-testid="text-edit-title">
          <Sparkles className="h-4 w-4 text-primary" />
          Edit Profile
        </h2>
        <Button 
          onClick={handleSave} 
          className="bg-primary hover:bg-primary/90 font-semibold text-xs"
          size="sm"
          data-testid="button-save-profile"
        >
          Save
        </Button>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-6">
        
        {/* Banner Section with Overlay */}
        <div>
          <div className="relative h-48 rounded-xl overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              data-testid="img-edit-banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transition-all hover-elevate shadow-lg"
              data-testid="button-change-banner"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center -mt-10 relative z-10">
          <Avatar className="w-24 h-24 ring-2 ring-primary border border-border shadow-md" data-testid="avatar-edit">
            <AvatarFallback className="text-xl font-bold bg-primary text-white">AC</AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary text-white hover:bg-primary/90"
            data-testid="button-change-avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Form Fields - Clean and Simple */}
        <div className="space-y-4 pt-2">
          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="font-semibold text-sm">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your display name"
              className="text-sm h-9"
              data-testid="input-displayname"
            />
          </div>

          {/* Username - Read Only */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">Username</Label>
            <div className="px-3 py-2 rounded-md border border-border bg-muted text-sm font-medium text-muted-foreground">
              @{formData.username}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="font-semibold text-sm">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="Tell your story..."
              className="min-h-20 resize-none text-sm"
              data-testid="input-bio"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground"></p>
              <p className={`text-xs font-medium ${charCount > 130 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {charCount}/150
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="font-semibold text-sm flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="text-sm h-9"
              data-testid="input-location"
            />
          </div>

          {/* Profession */}
          <div className="space-y-1.5">
            <Label htmlFor="profession" className="font-semibold text-sm flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Profession
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="What do you do?"
              className="text-sm h-9"
              data-testid="input-profession"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="font-semibold text-sm flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-primary" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="yoursite.com"
              className="text-sm h-9"
              data-testid="input-website"
            />
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-10 mt-4"
          data-testid="button-save-full"
        >
          Save Profile
        </Button>
      </div>
    </div>
  );
}
