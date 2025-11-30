import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Upload, ImageIcon, Sparkles, Sun, Contrast, CheckCircle2, Tag, Palette, Plus, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { GENRE_LIST } from "@shared/genres";
import { queryClient } from "@/lib/queryClient";

interface CreatePostProps {
  onClose: () => void;
  onPost?: (data: any) => void;
  onNavigateHome?: () => void;
}

const CATEGORY_ICONS: { [key: string]: { icon: string; color: string } } = {
  fashion: { icon: "👗", color: "from-pink-500/20 to-pink-600/20" },
  music: { icon: "🎵", color: "from-purple-500/20 to-purple-600/20" },
  art: { icon: "🎨", color: "from-blue-500/20 to-blue-600/20" },
  culture: { icon: "🌍", color: "from-green-500/20 to-green-600/20" },
  lifestyle: { icon: "✨", color: "from-yellow-500/20 to-yellow-600/20" },
};

const SUGGESTED_TAGS: { [key: string]: string[] } = {
  fashion: ["style", "ootd", "fashionista", "designer"],
  music: ["musician", "beats", "producer", "artist"],
  art: ["artwork", "artist", "creative", "masterpiece"],
  culture: ["tradition", "heritage", "community", "african"],
  lifestyle: ["vibes", "inspire", "daily", "creative"],
};

export default function CreatePost({ onClose, onPost, onNavigateHome }: CreatePostProps) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (mediaPreviews.length + files.length > 10) {
        toast({
          title: "Too many files",
          description: "Maximum 10 images/videos allowed",
          variant: "destructive",
        });
        return;
      }
      const newPreviews: string[] = [];
      let loaded = 0;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loaded++;
          setUploadProgress((loaded / files.length) * 100);
          if (loaded === files.length) {
            setMediaPreviews([...mediaPreviews, ...newPreviews]);
            setUploadProgress(0);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags([...tags, cleaned]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === " ") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handlePost = async () => {
    if (!caption || mediaPreviews.length === 0) {
      toast({
        title: t("create.missingFields"),
        description: t("create.missingFieldsDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let userId = localStorage.getItem("currentUserId");
      const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
      
      if (userData && userData.id && userData.id !== userId) {
        userId = userData.id;
      }
      
      if (!userId || userId === "current-user") {
        throw new Error("User not authenticated. Please sign in again.");
      }

      const allHashtags = [
        ...hashtags.split(/\s+/).filter(h => h.startsWith("#") || h.length > 0),
        ...tags.map(t => t.startsWith("#") ? t : `#${t}`)
      ].filter(Boolean).join(" ");

      const postData = {
        userId,
        caption,
        category: category || "lifestyle",
        hashtags: allHashtags || "",
        image: mediaPreviews[0],
        images: mediaPreviews,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to create post");

      const createdPost = await res.json();

      const previousPosts = (queryClient.getQueryData(['/api/posts']) || []) as any[];
      queryClient.setQueryData(['/api/posts'], [createdPost, ...previousPosts]);
      
      if (userData && userData.id) {
        const previousUserPosts = (queryClient.getQueryData(['/api/posts/user', userData.id]) || []) as any[];
        queryClient.setQueryData(['/api/posts/user', userData.id], [createdPost, ...previousUserPosts]);
      }
      
      onPost?.(createdPost);
      onNavigateHome?.();
      onClose();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: "Request timeout",
          description: "The upload took too long. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating post",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageStyle = {
    filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`,
  };

  const completionPercentage = Math.round(
    ((caption ? 20 : 0) + (mediaPreviews.length > 0 ? 20 : 0) + (category ? 20 : 0) + (tags.length > 0 ? 20 : 0) + (hashtags ? 20 : 0)) / 5
  );

  const suggestedTags = category && SUGGESTED_TAGS[category] ? SUGGESTED_TAGS[category] : [];
  const categoryColor = category && CATEGORY_ICONS[category] ? CATEGORY_ICONS[category].color : "";
  const categoryEmoji = category && CATEGORY_ICONS[category] ? CATEGORY_ICONS[category].icon : "";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-[430px] h-[95vh] sm:h-auto sm:max-h-[90vh] bg-background rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-primary/20 animate-in slide-in-from-bottom duration-400">
        {/* Floating Gradient Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Premium Header */}
        <div className="relative sticky top-0 z-10 bg-gradient-to-r from-background via-primary/10 to-background border-b border-primary/20 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            data-testid="button-close-create" 
            className="hover-elevate h-10 w-10 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-lg font-black bg-gradient-to-r from-primary via-orange-500 to-red-600 bg-clip-text text-transparent" data-testid="text-create-title">
              Share Your Story
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1 bg-muted rounded-full flex-1" style={{ width: `${completionPercentage}px` }}>
                <div 
                  className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-primary">{completionPercentage}%</span>
            </div>
          </div>

          <Button
            onClick={handlePost}
            disabled={!caption || mediaPreviews.length === 0 || isSubmitting}
            className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-sm gold-glow transition-all shadow-lg h-10 px-6 rounded-full"
            data-testid="button-submit-post"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Share
              </span>
            )}
          </Button>
        </div>

        {/* Content with Premium Spacing */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6 space-y-8">
            
            {/* Media Section - Premium Showcase */}
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Visual Content</p>
                  <p className="text-xs text-muted-foreground">{mediaPreviews.length}/10 media</p>
                </div>
              </div>

              {mediaPreviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Premium Grid Preview */}
                  <div className="relative">
                    <div className="grid grid-cols-4 gap-3">
                      {mediaPreviews.map((preview, index) => (
                        <div 
                          key={index} 
                          className="group relative rounded-xl overflow-hidden aspect-square animate-in fade-in duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            style={imageStyle}
                            data-testid={`img-preview-${index}`}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeMedia(index)}
                              data-testid={`button-remove-image-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                      
                      {mediaPreviews.length < 10 && (
                        <label
                          htmlFor="image-upload"
                          className="rounded-xl border-2 border-dashed border-primary/40 hover:border-primary/80 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all duration-200 flex items-center justify-center hover-elevate group animate-in fade-in duration-300"
                          data-testid="button-add-image"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 py-8">
                            <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                              <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-primary text-center">Add</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Advanced Filters - Premium Toggle */}
                  {mediaPreviews.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-2 hover-elevate border-primary/30 text-primary"
                        onClick={() => setShowFilters(!showFilters)}
                        data-testid="button-toggle-filters"
                      >
                        <Palette className="h-4 w-4" />
                        {showFilters ? "Hide" : "Show"} Advanced Filters
                      </Button>

                      {showFilters && (
                        <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/20 rounded-2xl p-5 space-y-5 animate-in fade-in duration-300">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-semibold">Brightness</Label>
                              </div>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{brightness[0]}%</span>
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

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Contrast className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-semibold">Contrast</Label>
                              </div>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{contrast[0]}%</span>
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

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-semibold">Saturation</Label>
                              </div>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{saturation[0]}%</span>
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
                    </>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-orange-500 to-red-600 rounded-full transition-all duration-300 shadow-lg shadow-primary/50"
                        style={{ width: `${uploadProgress}%` }}
                        data-testid="progress-upload"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="block p-8 border-2 border-dashed border-primary/40 hover:border-primary/80 bg-gradient-to-br from-primary/5 to-orange-500/5 hover:from-primary/10 hover:to-orange-500/10 rounded-2xl cursor-pointer transition-all duration-200 hover-elevate group"
                  data-testid="label-upload-zone"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 group-hover:from-primary/30 group-hover:to-orange-500/30 transition-all">
                      <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-foreground">Upload Your Masterpiece</p>
                      <p className="text-sm text-muted-foreground mt-2">Images or videos • Up to 10 files • Drag and drop or click</p>
                    </div>
                  </div>
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

            {/* Caption Section with Live Preview */}
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Caption</p>
                    <p className="text-xs text-muted-foreground">Tell your story</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs font-semibold text-primary hover:bg-primary/10"
                  data-testid="button-toggle-preview"
                >
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>
              
              <Textarea
                id="caption"
                placeholder="What's on your mind? Share your creative vision..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-24 resize-none text-base rounded-xl bg-card border-primary/20 focus:border-primary/50 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                data-testid="input-caption"
              />
              
              {/* Character Counter with Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">{caption.length} / 500</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${caption.length > 400 ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30" : "text-primary bg-primary/10"}`}>
                    {Math.round((caption.length / 500) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${caption.length > 400 ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gradient-to-r from-primary to-orange-500"}`}
                    style={{ width: `${(caption.length / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Section with Visual Indicators */}
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Category</p>
                  <p className="text-xs text-muted-foreground">Choose your creative domain</p>
                </div>
              </div>
              
              {/* Category Quick Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(CATEGORY_ICONS).map(([key, { icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`py-3 px-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 text-xs font-bold ${
                      category === key 
                        ? "bg-gradient-to-br " + categoryColor + " border-2 border-primary scale-110" 
                        : "bg-muted hover:bg-muted/80 border-2 border-transparent hover-elevate"
                    }`}
                    data-testid={`button-category-${key}`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="capitalize leading-none">{key.slice(0, 5)}</span>
                  </button>
                ))}
              </div>

              {/* Fallback Select */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category" className="text-base rounded-xl border-primary/20 focus:border-primary/50 focus:ring-primary/30 bg-card h-12 text-xs sm:text-base">
                  <SelectValue placeholder="Select a category..." />
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

            {/* Tags Section - Premium with Suggestions */}
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Tags</p>
                  <p className="text-xs text-muted-foreground">{tags.length}/10 tags</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Type and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="text-base rounded-xl bg-card border-primary/20 focus:border-primary/50 focus:ring-primary/30 flex-1 h-11"
                  data-testid="input-tags"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  data-testid="button-add-tag"
                  className="h-11 w-11 rounded-xl border-primary/20 hover:border-primary/50 hover-elevate"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {/* Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Suggested for {category}:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!tags.includes(tag) && tags.length < 10) {
                            setTags([...tags, tag]);
                          }
                        }}
                        disabled={tags.includes(tag) || tags.length >= 10}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          tags.includes(tag)
                            ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                            : "bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary hover-elevate"
                        }`}
                        data-testid={`button-suggest-tag-${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-gradient-to-r from-primary/20 to-orange-500/20 text-primary hover:from-primary/30 hover:to-orange-500/30 cursor-pointer text-xs font-semibold rounded-full px-4 py-2 gap-2 animate-in fade-in duration-200"
                      onClick={() => removeTag(idx)}
                      data-testid={`badge-tag-${tag}`}
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Hashtags Section */}
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Additional Hashtags</p>
                  <p className="text-xs text-muted-foreground">Boost discoverability</p>
                </div>
              </div>
              <Input
                id="hashtags"
                placeholder="#photography #art #creative #africancreators..."
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="text-base rounded-xl bg-card border-primary/20 focus:border-primary/50 focus:ring-primary/30 h-11"
                data-testid="input-hashtags"
              />
            </div>

            {/* Post Preview Card */}
            {showPreview && mediaPreviews.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-card border border-primary/20 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Live Preview</p>
                <div className="space-y-3">
                  <img 
                    src={mediaPreviews[0]} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-lg" 
                  />
                  <div className="space-y-2">
                    {caption && <p className="text-sm text-foreground line-clamp-3">{caption}</p>}
                    {category && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{categoryEmoji}</span>
                        <span className="text-xs font-bold text-primary capitalize">{category}</span>
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-primary font-semibold">#{tag}</span>
                        ))}
                        {tags.length > 3 && <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pro Tip Card */}
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-primary/10 via-orange-500/5 to-red-600/10 border border-primary/30 animate-in fade-in duration-500" style={{ animationDelay: "500ms" }}>
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">Pro Tip</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use descriptive captions and relevant tags to reach more creators. Mix popular and niche tags for maximum visibility. Engage authentically with the community!
                  </p>
                </div>
              </div>
            </div>

            {/* Spacing for bottom button */}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}