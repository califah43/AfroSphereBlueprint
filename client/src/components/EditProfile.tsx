import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Camera, MapPin, Link as LinkIcon, Briefcase } from "lucide-react";
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
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4 flex items-center justify-between z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover-elevate"
          data-testid="button-close-edit"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold" data-testid="text-edit-title">Edit Profile</h2>
        <Button 
          onClick={handleSave} 
          className="bg-primary hover:bg-primary/90 font-semibold"
          data-testid="button-save-profile"
        >
          Save
        </Button>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-6">
        
        {/* Banner Section */}
        <div>
          <div className="relative h-40 rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-pink-500">
              <img
                src={bannerImage}
                alt="Banner"
                className="w-full h-full object-cover opacity-90"
                data-testid="img-edit-banner"
              />
            </div>
            <div className="absolute inset-0 bg-black/20" />
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm border-white/20 hover:bg-background/90"
              data-testid="button-change-banner"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Banner
            </Button>
          </div>
        </div>

        {/* Avatar & Profile Photo Section */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover-elevate transition-all">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 ring-background border-2 border-primary/20" data-testid="avatar-edit">
                <AvatarFallback className="text-xl font-bold">AC</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-primary text-white border-primary hover:bg-primary/90"
                data-testid="button-change-avatar"
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="font-semibold">Profile Photo</p>
              <p className="text-sm text-muted-foreground">Click the camera icon to upload</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="font-semibold text-sm flex items-center gap-2">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your display name"
              className="border-border/50 bg-card/50 h-10 rounded-lg"
              data-testid="input-displayname"
            />
            <p className="text-xs text-muted-foreground">This is how your name appears publicly</p>
          </div>

          {/* Username - Read Only Info */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold text-sm flex items-center gap-2">
              Username
            </Label>
            <div className="px-4 py-2.5 rounded-lg border border-border/50 bg-muted/30 text-sm font-medium text-muted-foreground">
              @{formData.username}
            </div>
            <p className="text-xs text-muted-foreground">Username cannot be changed</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="font-semibold text-sm flex items-center gap-2">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="Tell your story..."
              className="min-h-28 resize-none border-border/50 bg-card/50 rounded-lg focus:ring-primary/50"
              data-testid="input-bio"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Share what makes you unique</p>
              <p className={`text-xs font-medium ${charCount > 130 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {charCount}/150
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="border-border/50 bg-card/50 h-10 rounded-lg"
              data-testid="input-location"
            />
            <p className="text-xs text-muted-foreground">Let people know where you're from</p>
          </div>

          {/* Profession */}
          <div className="space-y-2">
            <Label htmlFor="profession" className="font-semibold text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Profession
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="What do you do?"
              className="border-border/50 bg-card/50 h-10 rounded-lg"
              data-testid="input-profession"
            />
            <p className="text-xs text-muted-foreground">Your craft or specialty</p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="font-semibold text-sm flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="yoursite.com"
              className="border-border/50 bg-card/50 h-10 rounded-lg"
              data-testid="input-website"
            />
            <p className="text-xs text-muted-foreground">Link to your portfolio or website</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground font-medium">Pro Tip</p>
          <p className="text-xs text-muted-foreground mt-1">A complete profile helps you attract more followers and opportunities in the AfroSphere community.</p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold h-11 rounded-lg"
          data-testid="button-save-full"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
