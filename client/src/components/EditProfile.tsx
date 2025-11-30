import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Camera, MapPin, Link as LinkIcon, Briefcase, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { checkUsernameAvailability, validateUsernameFormat } from "@/lib/usernameService";
import BannerCropper from "./BannerCropper";
import bannerImage from "@assets/generated_images/Sunset_gradient_profile_banner_7206e8a3.png";

interface EditProfileProps {
  onClose: () => void;
  onSave?: (data: any) => void;
}

export default function EditProfile({ onClose, onSave }: EditProfileProps) {
  // Load real user data from localStorage
  const { toast } = useToast();
  const { t } = useLanguage();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
          avatar: userData.avatar || "",
          banner: userData.banner || "",
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
      avatar: "",
      banner: "",
    };
  };

  const [formData, setFormData] = useState(getInitialData());
  const [charCount, setCharCount] = useState(formData.bio.length);
  const [showBannerCropper, setShowBannerCropper] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | "invalid" | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const compressImage = (base64: string, maxSize = 500000): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxWidth = 800;
        const maxHeight = 800;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.9;
        let result = canvas.toDataURL("image/jpeg", quality);
        
        while (result.length > maxSize && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        
        resolve(result);
      };
      img.src = base64;
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Avatar file selected:", file.name, file.size);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const compressed = await compressImage(base64, 300000);
        console.log("Avatar compressed from", base64.length, "to", compressed.length);
        setFormData({ ...formData, avatar: compressed });
        toast({ title: t("profile.photoUpdated"), description: t("profile.photoReadyToSave") });
      };
      reader.onerror = () => {
        console.error("Failed to read avatar file");
        toast({ title: t("common.error"), description: t("profile.failedReadProfilePhoto"), variant: "destructive" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Banner file selected:", file.name, file.size);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const compressed = await compressImage(base64, 200000);
        console.log("Banner compressed from", base64.length, "to", compressed.length);
        setBannerToEdit(compressed);
        setShowBannerCropper(true);
      };
      reader.onerror = () => {
        console.error("Failed to read banner file");
        toast({ title: t("common.error"), description: t("profile.failedReadBannerImage"), variant: "destructive" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerCropApply = (croppedData: string) => {
    setFormData({ ...formData, banner: croppedData });
    setShowBannerCropper(false);
    toast({ title: t("profile.bannerUpdated"), description: t("profile.bannerReadyToSave") });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setFormData({ ...formData, bio: value });
      setCharCount(value.length);
    }
  };

  const handleUsernameChange = (newUsername: string) => {
    setFormData({ ...formData, username: newUsername });
    setIsEditingUsername(true);
    
    // Check format
    const validation = validateUsernameFormat(newUsername);
    if (!validation.valid) {
      setUsernameStatus("invalid");
      return;
    }
    
    // Check availability
    setUsernameStatus("checking");
    checkUsernameAvailability(newUsername).then((result) => {
      setUsernameStatus(result.available ? "available" : "taken");
    });
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("currentUserId");
      if (!userId) {
        toast({ title: t("common.error"), description: t("profile.userNotFound"), variant: "destructive" });
        return;
      }

      // Validate username if it changed
      const currentData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
      if (formData.username !== currentData.username) {
        // Check format validation
        const validation = validateUsernameFormat(formData.username);
        if (!validation.valid) {
          toast({ title: t("common.error"), description: validation.error || "Invalid username", variant: "destructive" });
          return;
        }
        
        // Check availability
        if (usernameStatus !== "available") {
          toast({ title: t("common.error"), description: "Username is not available or still checking", variant: "destructive" });
          return;
        }
      }

      const payload = {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        profession: formData.profession,
        ...(formData.avatar && formData.avatar !== currentData.avatar && { avatar: formData.avatar }),
        ...(formData.banner && formData.banner !== currentData.banner && { banner: formData.banner }),
      };

      console.log("Sending profile update with payload size:", JSON.stringify(payload).length);

      // Save to backend (text fields + images as base64)
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Save response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Save error response:", errorData);
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      // Get updated user from response
      const updatedUser = await response.json();
      console.log("Updated user received:", updatedUser);

      // Update localStorage with complete data including images from server
      const updated = {
        ...JSON.parse(localStorage.getItem("currentUserData") || "{}"),
        displayName: updatedUser.displayName || formData.displayName,
        username: updatedUser.username || formData.username,
        bio: updatedUser.bio || formData.bio,
        location: updatedUser.location || formData.location,
        website: updatedUser.website || formData.website,
        profession: updatedUser.profession || formData.profession,
        avatar: updatedUser.avatar || formData.avatar,
        banner: updatedUser.banner || formData.banner,
      };
      localStorage.setItem("currentUserData", JSON.stringify(updated));
      
      // Trigger comment refetch for username/badge updates
      window.dispatchEvent(new Event('profileUpdated'));
      toast({ title: t("profile.profileSaved"), description: t("profile.profileUpdatesSaved") });
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: t("common.error"), description: t("profile.failedToSaveProfile"), variant: "destructive" });
    }
  };

  if (showBannerCropper) {
    return (
      <BannerCropper
        imageUrl={bannerToEdit}
        onApply={handleBannerCropApply}
        onCancel={() => setShowBannerCropper(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Refined Header */}
      <div className="sticky top-0 bg-background/98 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center justify-between z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover-elevate"
          data-testid="button-close-edit"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-black tracking-tight" data-testid="text-edit-title">{t("profile.editProfile")}</h2>
        <Button 
          onClick={handleSave} 
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold rounded-lg text-xs h-8 px-3"
          data-testid="button-save-profile"
        >
          Save
        </Button>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 pb-20 space-y-4">
        
        {/* Banner Section - Refined */}
        <div>
          <div className="relative h-24 rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-pink-500">
              <img
                src={formData.banner || bannerImage}
                alt="Banner"
                className="w-full h-full object-cover opacity-85"
                data-testid="img-edit-banner"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm border border-border/30 hover:bg-background/80 rounded-lg p-2 text-xs flex items-center gap-1 hover-elevate"
              data-testid="button-change-banner"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="absolute opacity-0 w-0 h-0"
              data-testid="input-banner-file"
            />
          </div>
        </div>

        {/* Avatar Section - Elegant */}
        <div className="flex gap-3 items-start">
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16 ring-3 ring-background rounded-lg" data-testid="avatar-edit">
              {formData.avatar && <AvatarImage src={formData.avatar} alt="Profile" />}
              <AvatarFallback className="text-lg font-black rounded-lg">{formData.username?.[0]?.toUpperCase() || "A"}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full h-6 w-6 bg-primary text-white border-2 border-background hover:bg-primary/90 flex items-center justify-center hover-elevate"
              data-testid="button-change-avatar"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="absolute opacity-0 w-0 h-0"
              data-testid="input-avatar-file"
            />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-semibold text-foreground">Profile Photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tap camera icon to upload</p>
          </div>
        </div>

        {/* Form Fields - Refined & Compact */}
        <div className="space-y-3 mt-4 pt-2 border-t border-border/50">
          {/* Username - Editable with Availability Check */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider">Username</Label>
            <div className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
              usernameStatus === "available" ? "bg-green-500/5 border-green-500/30" :
              usernameStatus === "taken" ? "bg-red-500/5 border-red-500/30" :
              usernameStatus === "invalid" ? "bg-red-500/5 border-red-500/30" :
              "bg-muted/40 border-border/30"
            }`}>
              <span className="text-primary font-bold text-sm">@</span>
              <Input 
                id="username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="border-0 bg-transparent px-0 text-sm"
                data-testid="input-username"
              />
              {isEditingUsername && usernameStatus === "available" && (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" data-testid="icon-username-available" />
              )}
              {isEditingUsername && usernameStatus === "taken" && (
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" data-testid="icon-username-taken" />
              )}
              {isEditingUsername && usernameStatus === "checking" && (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" data-testid="icon-username-checking" />
              )}
            </div>
            {isEditingUsername && usernameStatus === "taken" && (
              <p className="text-xs text-red-500">Username already taken</p>
            )}
            {isEditingUsername && usernameStatus === "invalid" && (
              <p className="text-xs text-red-500">Use only letters, numbers, dot or underscore (3-30 chars)</p>
            )}
            {isEditingUsername && usernameStatus === "available" && (
              <p className="text-xs text-green-500">Username available!</p>
            )}
            {!isEditingUsername && (
              <p className="text-xs text-muted-foreground">Used for mentions and profile discovery</p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your display name"
              className="border-border/30 bg-card/40 h-9 rounded-lg text-sm"
              data-testid="input-displayname"
            />
            <p className="text-xs text-muted-foreground">How your name appears publicly</p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="Tell your story..."
              className="min-h-24 resize-none border-border/30 bg-card/40 rounded-lg text-sm"
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
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary/60" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="border-border/30 bg-card/40 h-9 rounded-lg text-sm"
              data-testid="input-location"
            />
          </div>

          {/* Profession */}
          <div className="space-y-1.5">
            <Label htmlFor="profession" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary/60" />
              Profession
            </Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="What do you do?"
              className="border-border/30 bg-card/40 h-9 rounded-lg text-sm"
              data-testid="input-profession"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-primary/60" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="yoursite.com"
              className="border-border/30 bg-card/40 h-9 rounded-lg text-sm"
              data-testid="input-website"
            />
          </div>
        </div>

        {/* Save Button - Prominent */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold h-10 rounded-lg text-sm mt-6"
          data-testid="button-save-full"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
