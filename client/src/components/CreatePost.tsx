import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface CreatePostProps {
  onClose: () => void;
  onPost?: (data: any) => void;
}

export default function CreatePost({ onClose, onPost }: CreatePostProps) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    console.log("Posting:", { caption, category, hashtags, imagePreview });
    onPost?.({ caption, category, hashtags, imagePreview });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-create">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold" data-testid="text-create-title">Create Post</h2>
        <Button
          onClick={handlePost}
          disabled={!caption || !imagePreview}
          className="bg-gradient-to-r from-primary to-orange-500"
          data-testid="button-submit-post"
        >
          Post
        </Button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image or Video</Label>
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                  data-testid="img-preview"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setImagePreview(null)}
                  data-testid="button-remove-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate"
                data-testid="label-upload-zone"
              >
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload image or video</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, MP4 up to 10MB</p>
              </label>
            )}
            <Input
              id="image-upload"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleImageUpload}
              data-testid="input-file-upload"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Share your culture..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-24 resize-none"
            data-testid="input-caption"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="culture">Culture</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hashtags">Hashtags</Label>
          <Input
            id="hashtags"
            placeholder="#fashion #art #music"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            data-testid="input-hashtags"
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground italic">
            💡 Tip: Share something that celebrates African creativity and culture!
          </p>
        </div>
      </div>
    </div>
  );
}
