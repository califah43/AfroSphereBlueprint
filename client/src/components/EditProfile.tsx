import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Camera } from "lucide-react";
import bannerImage from "@assets/generated_images/Sunset_gradient_profile_banner_7206e8a3.png";

interface EditProfileProps {
  onClose: () => void;
  onSave?: (data: any) => void;
}

export default function EditProfile({ onClose, onSave }: EditProfileProps) {
  const [formData, setFormData] = useState({
    displayName: "Adike Wilson",
    bio: "Fashion designer & cultural storyteller 🌍✨ Celebrating African creativity through modern design",
    location: "Lagos, Nigeria",
  });

  const handleSave = () => {
    console.log("Saving profile:", formData);
    onSave?.(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-edit">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold" data-testid="text-edit-title">Edit Profile</h2>
        <Button onClick={handleSave} data-testid="button-save-profile">
          Save
        </Button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full h-32 object-cover rounded-lg"
              data-testid="img-edit-banner"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2"
              data-testid="button-change-banner"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Banner
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20" data-testid="avatar-edit">
                <AvatarFallback className="text-xl">AC</AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 rounded-full h-7 w-7"
                data-testid="button-change-avatar"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <p className="font-semibold">Profile Photo</p>
              <p className="text-sm text-muted-foreground">Upload a new photo</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              data-testid="input-displayname"
            />
            <p className="text-xs text-muted-foreground">This is how your name appears on your profile</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-24 resize-none"
              data-testid="input-bio"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio.length}/150
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              data-testid="input-location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
