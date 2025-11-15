import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Upload, Image as ImageIcon, Sparkles, Crop, Contrast, Sun, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CollaborativePost from "./CollaborativePost";

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
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [showCollaborators, setShowCollaborators] = useState(false);
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

  const handlePost = () => {
    if (!caption || mediaPreviews.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please add a caption and at least one image",
        variant: "destructive",
      });
      return;
    }

    console.log("Posting:", { caption, category, hashtags, mediaPreviews, collaborators, filters: { brightness, contrast, saturation } });

    toast({
      title: "✨ Post created!",
      description: collaborators.length > 0 
        ? `Shared with ${collaborators.length} collaborator${collaborators.length > 1 ? 's' : ''}`
        : "Your post has been shared with the community.",
      className: "border-primary/20 bg-card",
    });

    onPost?.({ caption, category, hashtags, mediaPreviews, collaborators });
    onClose();
  };

  const imageStyle = {
    filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`,
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
          disabled={!caption || mediaPreviews.length === 0}
          className="bg-gradient-to-r from-primary to-orange-500"
          data-testid="button-submit-post"
        >
          Post
        </Button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Images or Videos</Label>
          <div className="relative">
            {mediaPreviews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative">
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
                        className="absolute top-2 right-2 h-6 w-6"
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
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Add more</p>
                    </label>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Filters</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm">Brightness</Label>
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
                        <div className="flex items-center gap-2">
                          <Contrast className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm">Contrast</Label>
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
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm">Saturation</Label>
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
                </div>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate"
                data-testid="label-upload-zone"
              >
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload images or videos</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, MP4 up to 10MB (max 10 files)</p>
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

        <div className="space-y-2">
          <Label>Collaborators (Optional)</Label>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowCollaborators(true)}
            type="button"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {collaborators.length > 0
              ? `${collaborators.length} collaborator${collaborators.length > 1 ? 's' : ''} added`
              : "Add collaborators"}
          </Button>
          {collaborators.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {collaborators.map((username) => (
                <div
                  key={username}
                  className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                >
                  <span>{username}</span>
                  <button
                    onClick={() => setCollaborators(collaborators.filter((u) => u !== username))}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground italic">
            💡 Tip: Share something that celebrates African creativity and culture!
          </p>
        </div>
      </div>

      {showCollaborators && (
        <CollaborativePost
          onClose={() => setShowCollaborators(false)}
          onAddCollaborators={(newCollaborators) => {
            setCollaborators(newCollaborators);
            setShowCollaborators(false);
          }}
        />
      )}
      </div>
    </div>
  );
}