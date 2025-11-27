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
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-1.5 flex items-center justify-between z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover-elevate"
          data-testid="button-close-edit"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-bold flex items-center gap-2" data-testid="text-edit-title">
          <Sparkles className="h-4 w-4 text-primary" />
          Edit Profile
        </h2>
        <Button 
          onClick={handleSave} 
          className="bg-primary hover:bg-primary/90 font-semibold text-xs h-7"
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

        {/* Avatar Section - Unique Design */}
        <div className="flex flex-col items-center -mt-12 relative z-10">
          <div className="relative mb-4">
            <div className="absolute -inset-3 bg-gradient-to-br from-orange-500/30 to-pink-500/30 rounded-full blur-md" />
            <Avatar className="w-28 h-28 ring-4 ring-background border-4 border-orange-500/50 shadow-2xl relative" data-testid="avatar-edit">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-orange-500 to-pink-500 text-white">AC</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 bg-gradient-to-br from-orange-500 to-pink-500 text-white border-4 border-background hover:shadow-lg transition-all hover-elevate shadow-lg"
              data-testid="button-change-avatar"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Tap camera to upload</p>
        </div>

        {/* Form Fields with Visual Grouping */}
        <div className="space-y-5 pt-4">
          {/* Display Name */}
          <div className="space-y-2.5 bg-gradient-to-br from-primary/5 to-orange-500/5 p-4 rounded-xl border border-primary/10 hover-elevate transition-all">
            <Label htmlFor="displayName" className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Display Name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your display name"
              className="bg-background/50 border-primary/30 focus:border-primary text-sm h-10 rounded-lg font-medium"
              data-testid="input-displayname"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">How the world sees your name</p>
          </div>

          {/* Username - Read Only Info */}
          <div className="space-y-2.5 bg-gradient-to-br from-muted/30 to-muted/5 p-4 rounded-xl border border-border/50">
            <Label htmlFor="username" className="font-bold text-sm text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              Username
            </Label>
            <div className="px-4 py-3 rounded-lg border border-border/50 bg-background text-sm font-bold text-primary">
              @{formData.username}
            </div>
            <p className="text-xs text-muted-foreground">Unique & permanent</p>
          </div>

          {/* Bio */}
          <div className="space-y-2.5 bg-gradient-to-br from-accent/5 to-purple-500/5 p-4 rounded-xl border border-accent/20 hover-elevate transition-all">
            <Label htmlFor="bio" className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Your Story
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="What makes you unique? Share your passion..."
              className="min-h-24 resize-none bg-background/50 border-accent/30 focus:border-accent rounded-lg text-sm focus:ring-accent/30"
              data-testid="input-bio"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Express yourself</p>
              <p className={`text-xs font-bold ${charCount > 130 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {charCount}/150
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2.5 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-4 rounded-xl border border-blue-500/20 hover-elevate transition-all">
            <Label htmlFor="location" className="font-bold text-sm text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="bg-background/50 border-blue-500/30 focus:border-blue-500 text-sm h-10 rounded-lg font-medium"
              data-testid="input-location"
            />
            <p className="text-xs text-muted-foreground">Where you create from</p>
          </div>

          {/* Profession */}
          <div className="space-y-2.5 bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-4 rounded-xl border border-green-500/20 hover-elevate transition-all">
            <Label htmlFor="profession" className="font-bold text-sm text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-green-500" />
              Craft
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Creator, Designer, Artist..."
              className="bg-background/50 border-green-500/30 focus:border-green-500 text-sm h-10 rounded-lg font-medium"
              data-testid="input-profession"
            />
            <p className="text-xs text-muted-foreground">Your specialty</p>
          </div>

          {/* Website */}
          <div className="space-y-2.5 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-4 rounded-xl border border-violet-500/20 hover-elevate transition-all">
            <Label htmlFor="website" className="font-bold text-sm text-foreground flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-violet-500" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="yoursite.com"
              className="bg-background/50 border-violet-500/30 focus:border-violet-500 text-sm h-10 rounded-lg font-medium"
              data-testid="input-website"
            />
            <p className="text-xs text-muted-foreground">Your portfolio link</p>
          </div>
        </div>

        {/* Info Box - Unique Style */}
        <div className="bg-gradient-to-br from-primary/20 via-orange-500/10 to-pink-500/10 border border-primary/30 rounded-xl p-4 shadow-lg">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Pro Tip
          </p>
          <p className="text-xs text-foreground mt-2 leading-relaxed">A complete profile helps you stand out and attract followers in the AfroSphere community. Be authentic!</p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:scale-105 text-white font-bold h-12 rounded-xl transition-all duration-300 shadow-lg"
          data-testid="button-save-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Save Your Profile
        </Button>
      </div>
    </div>
  );
}
