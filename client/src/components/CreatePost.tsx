import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Upload, ImageIcon, Sparkles, Sun, Contrast } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { GENRE_LIST } from "@shared/genres";

interface CreatePostProps {
  onClose: () => void;
  onPost?: (data: any) => void;
}

export default function CreatePost({ onClose, onPost }: CreatePostProps) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setMediaPreviews([...mediaPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!caption || mediaPreviews.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please add a caption and at least one image",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = localStorage.getItem("currentUserId") || "current-user";
      
      const postData = {
        userId,
        caption,
        category: category || "lifestyle",
        image: mediaPreviews[0],
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create post");
      }

      // Invalidate posts query to refresh the feed
      await queryClient.invalidateQueries({ queryKey: ['/api/posts'] });

      toast({
        title: "✨ Post created!",
        description: "Your post has been shared with the community.",
        className: "border-primary/20 bg-card",
      });

      onPost?.(postData);
      onClose();
    } catch (error: any) {
      console.error("Post creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const imageStyle = {
    filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`,
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-[430px] mx-auto bg-background rounded-t-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-create" className="hover-elevate">
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-base font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent" data-testid="text-create-title">
            Create Post
          </h2>
          <Button
            onClick={handlePost}
            disabled={!caption || mediaPreviews.length === 0}
            className="bg-gradient-to-r from-primary to-orange-500 text-white font-semibold text-sm"
            size="sm"
            data-testid="button-submit-post"
          >
            Share
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Media Upload */}
            <div className="space-y-2">
              {mediaPreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                          style={imageStyle}
                          data-testid={`img-preview-${index}`}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMedia(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {mediaPreviews.length < 10 && (
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover-elevate transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">Add</p>
                      </label>
                    )}
                  </div>

                  {/* Filters Toggle */}
                  {mediaPreviews.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setShowFilters(!showFilters)}
                      data-testid="button-toggle-filters"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                  )}

                  {/* Filters */}
                  {showFilters && (
                    <div className="bg-muted/40 rounded-lg p-3 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Sun className="h-3 w-3 text-muted-foreground" />
                            <Label className="text-xs">Brightness</Label>
                          </div>
                          <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
                        </div>
                        <Slider
                          value={brightness}
                          onValueChange={setBrightness}
                          min={50}
                          max={150}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Contrast className="h-3 w-3 text-muted-foreground" />
                            <Label className="text-xs">Contrast</Label>
                          </div>
                          <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
                        </div>
                        <Slider
                          value={contrast}
                          onValueChange={setContrast}
                          min={50}
                          max={150}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-muted-foreground" />
                            <Label className="text-xs">Saturation</Label>
                          </div>
                          <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
                        </div>
                        <Slider
                          value={saturation}
                          onValueChange={setSaturation}
                          min={0}
                          max={200}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover-elevate transition-all"
                  data-testid="label-upload-zone"
                >
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Add photos or videos</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Max 10 files, 10MB each</p>
                </label>
              )}
              <Input
                id="image-upload"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
                data-testid="input-file-upload"
              />
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <Label htmlFor="caption" className="text-xs font-semibold">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Share your culture..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-16 resize-none text-sm"
                data-testid="input-caption"
              />
              <p className="text-xs text-muted-foreground">{caption.length}/500</p>
            </div>

            {/* Category & Hashtags */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs font-semibold">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category" className="text-sm">
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">👗 Fashion</SelectItem>
                    <SelectItem value="music">🎵 Music</SelectItem>
                    <SelectItem value="art">🎨 Art</SelectItem>
                    <SelectItem value="culture">🌍 Culture</SelectItem>
                    <SelectItem value="lifestyle">✨ Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="hashtags" className="text-xs font-semibold">Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="#fashion #art"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="text-sm"
                  data-testid="input-hashtags"
                />
              </div>
            </div>

            {/* Tip */}
            <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                ✨ <span className="font-semibold text-foreground">Pro tip:</span> Posts celebrating African creativity perform best!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
