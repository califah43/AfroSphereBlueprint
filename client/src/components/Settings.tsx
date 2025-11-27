import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, X, LogOut, Bell, Lock, Shield, Palette, Users, Eye, 
  Heart, Share2, Volume2, Smartphone, Mail, AlertCircle,
  HelpCircle, Info, Trash2, CheckCircle2, Moon, Sun, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onClose: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
}

interface SettingsSections {
  account: {
    privateAccount: boolean;
    allowComments: boolean;
    allowMentions: boolean;
  };
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    trending: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  privacy: {
    downloadData: boolean;
    activityStatus: boolean;
    readReceipts: boolean;
  };
  display: {
    darkMode: boolean;
    textSize: "normal" | "large" | "extra-large";
    language: "en" | "es" | "fr";
  };
  content: {
    hideExplicit: boolean;
    mutedWords: boolean;
    restrictedMode: boolean;
  };
}

export default function Settings({ onClose, onLogout, onEditProfile }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsSections>({
    account: {
      privateAccount: false,
      allowComments: true,
      allowMentions: true,
    },
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      trending: true,
      pushNotifications: true,
      emailNotifications: true,
    },
    privacy: {
      downloadData: false,
      activityStatus: true,
      readReceipts: true,
    },
    display: {
      darkMode: true,
      textSize: "normal",
      language: "en",
    },
    content: {
      hideExplicit: false,
      mutedWords: false,
      restrictedMode: false,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState<"none" | "email" | "password" | "phone" | "help" | "report" | "about" | "guidelines" | "blocked" | "reportContent" | "textSize" | "download" | "sessions" | "2fa" | "language">("none");
  const [editData, setEditData] = useState({ email: "", phone: "", password: "", newPassword: "", confirmPassword: "", reportText: "" });
  const { toast } = useToast();
  const userId = localStorage.getItem("currentUserId") || "default-user";
  const currentUserData = localStorage.getItem("currentUserData") ? JSON.parse(localStorage.getItem("currentUserData")!) : {};

  // Apply text size and dark mode to DOM
  const applyDisplaySettings = (textSize: string, darkMode: boolean) => {
    document.documentElement.setAttribute("data-text-size", textSize);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`/api/settings/${userId}`);
        if (res.ok) {
          const data = await res.json();
          const newSettings = {
            account: {
              privateAccount: data.privateAccount || false,
              allowComments: data.allowComments ?? true,
              allowMentions: data.allowMentions ?? true,
            },
            notifications: {
              likes: data.notificationsLikes ?? true,
              comments: data.notificationsComments ?? true,
              follows: data.notificationsFollows ?? true,
              trending: data.notificationsTrending ?? true,
              pushNotifications: data.notificationsPush ?? true,
              emailNotifications: data.notificationsEmail ?? true,
            },
            privacy: {
              downloadData: false,
              activityStatus: data.privacyActivityStatus ?? true,
              readReceipts: data.privacyReadReceipts ?? true,
            },
            display: {
              darkMode: data.displayDarkMode ?? true,
              textSize: data.displayTextSize || "normal",
              language: data.displayLanguage || "en",
            },
            content: {
              hideExplicit: data.contentHideExplicit || false,
              mutedWords: data.contentMutedWords || false,
              restrictedMode: data.contentRestrictedMode || false,
            },
          };
          setSettings(newSettings);
          applyDisplaySettings(newSettings.display.textSize, newSettings.display.darkMode);
        }
      } catch (error) {
        console.log("Using default settings");
        applyDisplaySettings("normal", true);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [userId]);

  const handleToggle = async (section: keyof SettingsSections, settingKey: string, value: boolean | string) => {
    // Update UI immediately for instant feedback
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [settingKey]: value
      }
    };
    setSettings(newSettings);

    // Apply setting changes to app behavior
    if (section === "display" && settingKey === "darkMode") {
      if (value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    if (section === "display" && settingKey === "textSize") {
      document.documentElement.setAttribute("data-text-size", String(value));
    }

    try {
      const payload: any = {};
      if (section === "account") {
        payload.privateAccount = newSettings.account.privateAccount;
        payload.allowComments = newSettings.account.allowComments;
        payload.allowMentions = newSettings.account.allowMentions;
      } else if (section === "notifications") {
        payload.notificationsLikes = newSettings.notifications.likes;
        payload.notificationsComments = newSettings.notifications.comments;
        payload.notificationsFollows = newSettings.notifications.follows;
        payload.notificationsTrending = newSettings.notifications.trending;
        payload.notificationsPush = newSettings.notifications.pushNotifications;
        payload.notificationsEmail = newSettings.notifications.emailNotifications;
      } else if (section === "privacy") {
        payload.privacyActivityStatus = newSettings.privacy.activityStatus;
        payload.privacyReadReceipts = newSettings.privacy.readReceipts;
      } else if (section === "display") {
        payload.displayDarkMode = newSettings.display.darkMode;
        payload.displayTextSize = newSettings.display.textSize;
        payload.displayLanguage = newSettings.display.language;
      } else if (section === "content") {
        payload.contentHideExplicit = newSettings.content.hideExplicit;
        payload.contentMutedWords = newSettings.content.mutedWords;
        payload.contentRestrictedMode = newSettings.content.restrictedMode;
      }

      const res = await fetch(`/api/settings/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Saved",
          description: `${settingKey.replace(/([A-Z])/g, ' $1').trim()} updated`,
          className: "border-primary/20 bg-card text-xs",
          duration: 2000,
        });
      } else {
        console.error("Failed to save settings");
        setSettings(settings);
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSettings(settings);
      toast({
        title: "Connection Error",
        description: "Unable to save settings. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSaveEmail = async () => {
    if (!editData.email || !editData.phone) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    try {
      const updated = { ...currentUserData, email: editData.email, phone: editData.phone };
      localStorage.setItem("currentUserData", JSON.stringify(updated));
      toast({ title: "Saved", description: "Email and phone updated" });
      setEditMode("none");
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleSavePassword = async () => {
    if (!editData.password || !editData.newPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (editData.newPassword !== editData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/settings/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: editData.newPassword }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Password changed successfully" });
        setEditData({ email: "", phone: "", password: "", newPassword: "", confirmPassword: "", reportText: "" });
        setEditMode("none");
      } else {
        toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    }
  };

  const SettingButton = ({ icon: Icon, label, description, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-start justify-between p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all"
      data-testid={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start gap-3 text-left">
        <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </button>
  );

  const SettingToggle = ({ icon: Icon, label, description, section, settingKey }: any) => {
    const currentValue = (settings[section as keyof SettingsSections] as any)[settingKey];
    return (
      <div className="flex items-start justify-between p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all" data-testid={`setting-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <Label htmlFor={`${section}-${settingKey}`} className="text-sm font-medium cursor-pointer">{label}</Label>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <Switch
          id={`${section}-${settingKey}`}
          checked={currentValue}
          onCheckedChange={(value) => handleToggle(section, settingKey, value)}
          data-testid={`switch-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
      </div>
    );
  };

  // Modal renderers
  const Modal = ({ title, children }: any) => (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold">{title}</h2>
        <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
      </div>
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">{children}</div>
    </div>
  );

  if (editMode === "help") {
    return (
      <Modal title="Help Center">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-sm mb-2">Getting Started on AfroSphere</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Welcome to Africa's creative home! AfroSphere is designed to help you discover, create, and share content with a vibrant community of African creators, artists, musicians, and cultural enthusiasts.</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Creating Your First Post</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">1. Tap the create button (+) in the bottom navigation. 2. Choose from Fashion, Music, Art, Culture, or Lifestyle categories. 3. Add a title, description, and tags. 4. Select an image or video from your gallery. 5. Preview your post and hit publish!</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Discovering Content</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Use the Explore tab to discover trending posts from your favorite categories. Follow creators you love, like posts, and leave thoughtful comments. The more you engage, the better our algorithm gets to know your taste!</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Profile Management</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Customize your profile with a bio, profile picture, and header image. Add links to your social media or external website. Verify your email to get a verification badge and unlock creator features.</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Notifications & Engagement</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">You'll receive notifications for likes, comments, new followers, and trending posts. Customize your notification preferences in Settings to control how often you hear from us. You can enable push and email notifications too.</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Privacy & Safety</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Make your account private to control who sees your content. Block users who make you uncomfortable. Report inappropriate content to help us maintain a safe and respectful community. All reports are reviewed by our team within 24 hours.</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Creator Program</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Earn creator badges by maintaining consistent engagement and following community guidelines. Featured creators get promoted across the platform. Join our partner program to monetize your content and collaborate with brands.</p>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-2 uppercase tracking-wide">Troubleshooting</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Posts not showing? Clear your cache. Can't upload? Check file size (max 100MB) and format (jpg, png, mp4, webm). Still stuck? Report a problem through Settings and our support team will help within 48 hours.</p>
          </div>

          <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Got It</Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "report") {
    return (
      <Modal title="Report a Problem">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Help us improve AfroSphere by reporting any issues you encounter. Our support team reviews all reports within 24 hours.</p>
          <textarea 
            placeholder="Describe your issue in detail..." 
            className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-32 resize-none" 
            value={editData.reportText} 
            onChange={(e) => setEditData({...editData, reportText: e.target.value})} 
            data-testid="textarea-report"
          />
          <p className="text-xs text-muted-foreground">Include steps to reproduce the issue and which device you're using.</p>
          <Button 
            onClick={() => { 
              if (editData.reportText?.trim()) { 
                toast({ 
                  title: "Report submitted", 
                  description: "Thank you! Our team will review your report shortly.",
                  duration: 3000
                }); 
                setEditData({ email: "", phone: "", password: "", newPassword: "", confirmPassword: "", reportText: "" });
                setEditMode("none"); 
              } else {
                toast({
                  title: "Error",
                  description: "Please describe the issue",
                  variant: "destructive"
                });
              }
            }} 
            className="w-full bg-primary"
            data-testid="button-submit-report"
          >
            Submit Report
          </Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "about") {
    return (
      <Modal title="About AfroSphere">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold text-primary mb-1">AfroSphere v1.0.0</p>
            <p className="text-xs text-muted-foreground">Africa's Creative Home for Emerging Artists, Musicians & Cultural Creators</p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1">Our Mission</p>
            <p className="text-xs text-muted-foreground leading-relaxed">To empower African creators by providing a platform where their talent can shine globally. We celebrate African creativity in all its forms—from fashion to music, art to culture, and lifestyle content that inspires.</p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1">What We Believe</p>
            <p className="text-xs text-muted-foreground leading-relaxed">African talent is world-class. Creators deserve to be recognized and rewarded for their work. Community thrives on authenticity, respect, and mutual support. Innovation comes from diverse perspectives.</p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1">Platform Features</p>
            <p className="text-xs text-muted-foreground leading-relaxed">TikTok-style feeds • Multi-category content discovery • Creator badges • Real-time notifications • Secure privacy controls • Community guidelines enforcement • Creator partnership program</p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1">Built For Creators, By Creators</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Our team includes African creators, developers, and community leaders passionate about building the platform we wanted to see. Every feature is designed with creator feedback in mind.</p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded p-3">
            <p className="text-xs font-semibold mb-1">Contact & Support</p>
            <p className="text-xs text-muted-foreground">support@afrosphere.com | twitter.com/afrosphere | instagram.com/afrosphere</p>
          </div>

          <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-4">Close</Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "guidelines") {
    return (
      <Modal title="Community Guidelines">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-semibold">AfroSphere is built on respect, creativity, and authenticity. These guidelines help us maintain a safe space for everyone.</p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">1. Be Respectful</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Treat all creators with dignity and kindness, regardless of race, gender, religion, orientation, or background. Celebrate diversity. Constructive criticism is welcome; mean-spirited comments are not.</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">2. No Harassment</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Don't engage in bullying, threats, hate speech, or discriminatory language. Don't impersonate others or share private information without consent. Account violations may result in permanent bans.</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">3. Respect Intellectual Property</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Share only content you created or have permission to share. Respect artists' rights. Give credit when inspired by someone's work. Don't plagiarize music, art, or writing.</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">4. Keep It Legal & Safe</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Don't promote illegal activities, violence, or substance abuse. Don't share explicit content (this is a family-friendly platform). Sexual content is prohibited. Scams and fraud will be prosecuted.</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">5. Authentic Engagement</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Don't use bots, fake accounts, or buy followers. Don't spam. Genuine engagement builds real community. Quality over quantity always.</p>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
            <p className="text-xs font-semibold text-destructive mb-1">Violations</p>
            <p className="text-xs text-muted-foreground">First violation: warning. Second: temporary ban. Third: permanent ban. Severe violations result in immediate action.</p>
          </div>

          <Button onClick={() => setEditMode("none")} className="w-full bg-primary">I Agree to These Guidelines</Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "blocked") {
    return (
      <Modal title="Blocked Users">
        <div className="space-y-4">
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">You currently have no blocked users</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed"><strong>How Blocking Works:</strong> Blocked users cannot see your posts, find your profile, or send you messages. They won't be notified that they're blocked, but they'll see an error if they try to interact with you.</p>
          <p className="text-xs text-muted-foreground leading-relaxed"><strong>To Block Someone:</strong> Go to their profile, tap the three-dot menu, and select "Block". You can unblock them anytime from this screen.</p>
          <Button onClick={() => setEditMode("none")} className="w-full bg-primary">Done</Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "reportContent") {
    return (
      <Modal title="Report Content">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Help us keep AfroSphere safe. Your report is anonymous and will be reviewed within 24 hours.</p>
          <textarea 
            placeholder="Why are you reporting this post? Be specific..." 
            className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-32 resize-none" 
            value={editData.reportText} 
            onChange={(e) => setEditData({...editData, reportText: e.target.value})}
            data-testid="textarea-report-content"
          />
          <div className="text-xs text-muted-foreground bg-card/50 p-3 rounded">
            <p className="font-semibold mb-1">Common reasons to report:</p>
            <p>• Hate speech or harassment • Explicit/adult content • Copyright infringement • Spam • Misleading information • Other</p>
          </div>
          <Button 
            onClick={() => { 
              if (editData.reportText?.trim()) { 
                toast({ 
                  title: "Report submitted", 
                  description: "Thank you for helping keep our community safe.",
                  duration: 3000
                }); 
                setEditData({ email: "", phone: "", password: "", newPassword: "", confirmPassword: "", reportText: "" });
                setEditMode("none"); 
              } else {
                toast({
                  title: "Error",
                  description: "Please explain why you're reporting this",
                  variant: "destructive"
                });
              }
            }} 
            className="w-full bg-primary"
            data-testid="button-submit-content-report"
          >
            Submit Report
          </Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "textSize") {
    return (
      <Modal title="Text Size">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Choose a text size that's comfortable for you. Preview the changes below:</p>
          <div className="space-y-3">
            <Button 
              onClick={async () => { 
                const newSettings = {...settings, display: {...settings.display, textSize: "normal"}};
                setSettings(newSettings);
                document.documentElement.setAttribute("data-text-size", "normal");
                await handleToggle("display", "textSize", "normal");
              }} 
              variant={settings.display.textSize === "normal" ? "default" : "outline"} 
              className="w-full justify-start"
              data-testid="button-text-size-normal"
            >
              <span className="text-sm">Normal Text</span>
            </Button>
            <Button 
              onClick={async () => { 
                const newSettings = {...settings, display: {...settings.display, textSize: "large"}};
                setSettings(newSettings);
                document.documentElement.setAttribute("data-text-size", "large");
                await handleToggle("display", "textSize", "large");
              }} 
              variant={settings.display.textSize === "large" ? "default" : "outline"} 
              className="w-full justify-start"
              data-testid="button-text-size-large"
            >
              <span className="text-base">Large Text</span>
            </Button>
            <Button 
              onClick={async () => { 
                const newSettings = {...settings, display: {...settings.display, textSize: "extra-large"}};
                setSettings(newSettings);
                document.documentElement.setAttribute("data-text-size", "extra-large");
                await handleToggle("display", "textSize", "extra-large");
              }} 
              variant={settings.display.textSize === "extra-large" ? "default" : "outline"} 
              className="w-full justify-start"
              data-testid="button-text-size-xl"
            >
              <span className="text-lg">Extra Large Text</span>
            </Button>
          </div>
          <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Done</Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "download") {
    return (
      <Modal title="Download Your Data">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">Your data download will include your profile information, posts, comments, likes, followers list, and activity history in a portable format (JSON).</p>
          <div className="bg-card/50 border border-border rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold">What's Included:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Profile data & settings</li>
              <li>✓ All posts & videos</li>
              <li>✓ Comments & replies</li>
              <li>✓ Followers & following list</li>
              <li>✓ Activity history</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">This is part of your data privacy rights. The download will be available for 7 days.</p>
          <Button 
            onClick={() => { 
              toast({ 
                title: "Download initiated", 
                description: "Check your email for the download link. It will be ready in a few minutes.",
                duration: 4000
              }); 
              setEditMode("none"); 
            }} 
            className="w-full bg-primary"
            data-testid="button-download-data"
          >
            Download My Data
          </Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "sessions") {
    return (
      <Modal title="Active Sessions">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Manage devices where you're logged into your account. Sign out of sessions you don't recognize for better security.</p>
          <div className="bg-card/50 border border-primary/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold">This Device</p>
                <p className="text-xs text-muted-foreground">Active now</p>
                <p className="text-xs text-muted-foreground mt-1">Android • Last active now</p>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Current</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Don't recognize a device? Sign it out and change your password for security.</p>
          <Button 
            onClick={() => setEditMode("none")} 
            className="w-full bg-primary"
            data-testid="button-close-sessions"
          >
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "2fa") {
    return (
      <Modal title="Two-Factor Authentication">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">Two-Factor Authentication adds an extra security layer to your account. When enabled, you'll need to provide a code from your phone in addition to your password when logging in.</p>
          
          <div className="bg-card/50 border border-border rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold">Benefits:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Protects against unauthorized access</li>
              <li>✓ Secure even if password is compromised</li>
              <li>✓ Works with authenticator apps</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">Use an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy to generate codes.</p>

          <Button 
            onClick={() => { 
              toast({ 
                title: "2FA enabled", 
                description: "Your account is now protected with two-factor authentication",
                duration: 3000
              }); 
              setEditMode("none"); 
            }} 
            className="w-full bg-primary"
            data-testid="button-enable-2fa"
          >
            Enable 2FA
          </Button>
        </div>
      </Modal>
    );
  }

  if (editMode === "language") {
    return (
      <Modal title="Language">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Choose your preferred language. This will change the entire interface.</p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => { 
                setSettings({...settings, display: {...settings.display, language: "en"}}); 
                handleToggle("display", "language", true); 
                toast({ title: "Language changed", description: "English selected", duration: 2000 }); 
                setEditMode("none"); 
              }} 
              variant={settings.display.language === "en" ? "default" : "outline"} 
              className="w-full"
              data-testid="button-language-en"
            >
              English
            </Button>
            <Button 
              onClick={() => { 
                setSettings({...settings, display: {...settings.display, language: "es"}}); 
                handleToggle("display", "language", true); 
                toast({ title: "Idioma cambiado", description: "Español seleccionado", duration: 2000 }); 
                setEditMode("none"); 
              }} 
              variant={settings.display.language === "es" ? "default" : "outline"} 
              className="w-full"
              data-testid="button-language-es"
            >
              Español
            </Button>
            <Button 
              onClick={() => { 
                setSettings({...settings, display: {...settings.display, language: "fr"}}); 
                handleToggle("display", "language", true); 
                toast({ title: "Langue changée", description: "Français sélectionné", duration: 2000 }); 
                setEditMode("none"); 
              }} 
              variant={settings.display.language === "fr" ? "default" : "outline"} 
              className="w-full"
              data-testid="button-language-fr"
            >
              Français
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Edit modals
  if (editMode === "email") {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Email & Phone</h2>
          <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
        </div>
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input type="tel" placeholder="+234 123 456 7890" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          </div>
          <Button onClick={handleSaveEmail} className="w-full bg-primary">Save Changes</Button>
        </div>
      </div>
    );
  }

  if (editMode === "password") {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Change Password</h2>
          <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
        </div>
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={editData.newPassword} onChange={(e) => setEditData({...editData, newPassword: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={editData.confirmPassword} onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})} />
          </div>
          <Button onClick={handleSavePassword} className="w-full bg-primary">Update Password</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10 backdrop-blur-sm bg-background/95">
        <h2 className="text-2xl font-bold flex items-center gap-2" data-testid="text-settings-title">
          <Shield className="h-6 w-6 text-primary" />
          Settings
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover-elevate"
          data-testid="button-close-settings"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-32 space-y-6">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading settings...</div>
        ) : (
        <>
        {/* ACCOUNT SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Account</h3>
          <div className="space-y-2">
            <SettingButton
              icon={Mail}
              label="Email & Phone"
              description="Manage your contact information"
              onClick={() => setEditMode("email")}
            />
            <SettingButton
              icon={Users}
              label="Edit Profile"
              description="Update username, display name, bio"
              onClick={() => {
                onEditProfile?.();
                onClose();
              }}
            />
            <SettingButton
              icon={Lock}
              label="Change Password"
              description="Update your account security"
              onClick={() => setEditMode("password")}
            />
            <SettingToggle
              icon={Eye}
              label="Private Account"
              description="Only followers can see your posts"
              section="account"
              settingKey="privateAccount"
            />
            <SettingToggle
              icon={Bell}
              label="Allow Comments"
              description="Anyone can comment on posts"
              section="account"
              settingKey="allowComments"
            />
            <SettingToggle
              icon={Users}
              label="Allow Mentions"
              description="Allow others to mention you"
              section="account"
              settingKey="allowMentions"
            />
          </div>
        </div>

        {/* NOTIFICATIONS SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Notifications</h3>
          <div className="space-y-2">
            <SettingToggle
              icon={Heart}
              label="Likes"
              description="Get notified when someone likes your post"
              section="notifications"
              settingKey="likes"
            />
            <SettingToggle
              icon={Info}
              label="Comments"
              description="Get notified on new comments"
              section="notifications"
              settingKey="comments"
            />
            <SettingToggle
              icon={Users}
              label="New Followers"
              description="Get notified when someone follows you"
              section="notifications"
              settingKey="follows"
            />
            <SettingToggle
              icon={Share2}
              label="Trending Posts"
              description="Be notified of trending content"
              section="notifications"
              settingKey="trending"
            />
            <SettingToggle
              icon={Bell}
              label="Push Notifications"
              description="Receive push notifications"
              section="notifications"
              settingKey="pushNotifications"
            />
            <SettingToggle
              icon={Mail}
              label="Email Notifications"
              description="Receive email digests"
              section="notifications"
              settingKey="emailNotifications"
            />
          </div>
        </div>

        {/* PRIVACY & SAFETY SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Privacy & Safety</h3>
          <div className="space-y-2">
            <SettingButton
              icon={Users}
              label="Blocked Users"
              description="Manage blocked accounts"
              onClick={() => setEditMode("blocked")}
            />
            <SettingToggle
              icon={Eye}
              label="Activity Status"
              description="Show when you're online"
              section="privacy"
              settingKey="activityStatus"
            />
            <SettingToggle
              icon={CheckCircle2}
              label="Read Receipts"
              description="Let people see when you read messages"
              section="privacy"
              settingKey="readReceipts"
            />
            <SettingButton
              icon={AlertCircle}
              label="Report Content"
              description="Report inappropriate posts"
              onClick={() => setEditMode("reportContent")}
            />
          </div>
        </div>

        {/* CONTENT PREFERENCES SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Content Preferences</h3>
          <div className="space-y-2">
            <SettingToggle
              icon={AlertCircle}
              label="Hide Explicit Content"
              description="Filter sensitive content"
              section="content"
              settingKey="hideExplicit"
            />
            <SettingToggle
              icon={Volume2}
              label="Muted Words"
              description="Hide posts with certain words"
              section="content"
              settingKey="mutedWords"
            />
            <SettingToggle
              icon={Shield}
              label="Restricted Mode"
              description="Hide mature content"
              section="content"
              settingKey="restrictedMode"
            />
          </div>
        </div>

        {/* DISPLAY & THEME SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Display & Theme</h3>
          <div className="space-y-2">
            <SettingToggle
              icon={Moon}
              label="Dark Mode"
              description="Enable dark theme"
              section="display"
              settingKey="darkMode"
            />
            <SettingButton
              icon={Globe}
              label="Language"
              description={`Current: ${settings.display.language === 'en' ? 'English' : settings.display.language === 'es' ? 'Español' : 'Français'}`}
              onClick={() => setEditMode("language")}
            />
            <SettingButton
              icon={Sun}
              label="Text Size"
              description={`Current: ${settings.display.textSize === 'normal' ? 'Normal' : settings.display.textSize === 'large' ? 'Large' : 'Extra Large'}`}
              onClick={() => setEditMode("textSize")}
            />
          </div>
        </div>

        {/* DATA & SECURITY SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Data & Security</h3>
          <div className="space-y-2">
            <SettingButton
              icon={Smartphone}
              label="Download Your Data"
              description="Get a copy of your data"
              onClick={() => setEditMode("download")}
            />
            <SettingButton
              icon={Shield}
              label="Active Sessions"
              description="View and manage logged-in devices"
              onClick={() => setEditMode("sessions")}
            />
            <SettingButton
              icon={AlertCircle}
              label="Two-Factor Authentication"
              description="Add extra security to your account"
              onClick={() => setEditMode("2fa")}
            />
          </div>
        </div>

        {/* SUPPORT & INFO SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Support & Info</h3>
          <div className="space-y-2">
            <SettingButton
              icon={HelpCircle}
              label="Help Center"
              description="Browse FAQs and guides"
              onClick={() => setEditMode("help")}
            />
            <SettingButton
              icon={AlertCircle}
              label="Report a Problem"
              description="Tell us what's wrong"
              onClick={() => setEditMode("report")}
            />
            <SettingButton
              icon={Info}
              label="About AfroSphere"
              description="Version 1.0.0 • Learn more about us"
              onClick={() => setEditMode("about")}
            />
            <SettingButton
              icon={Globe}
              label="Community Guidelines"
              description="Our values and rules"
              onClick={() => setEditMode("guidelines")}
            />
          </div>
        </div>

        {/* DANGER ZONE SECTION */}
        <div>
          <h3 className="text-xs font-bold text-destructive uppercase tracking-wider mb-4">Danger Zone</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 px-4 border-destructive/50 hover:bg-destructive/5"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-destructive">Logout</p>
                <p className="text-xs text-muted-foreground">Sign out from this device</p>
              </div>
              <ChevronRight className="h-5 w-5 text-destructive ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 px-4 border-destructive/50 hover:bg-destructive/5"
              onClick={() => {
                const confirmed = window.confirm("Are you absolutely sure? This will permanently delete your account and all your data. This cannot be undone.");
                if (confirmed) {
                  const doubleConfirm = window.confirm("This is your final warning. Your account will be permanently deleted. Continue?");
                  if (doubleConfirm) {
                    toast({ 
                      title: "Account deletion initiated", 
                      description: "Check your email to confirm deletion. You have 30 days to cancel.",
                      duration: 4000
                    });
                  }
                }
              }}
              data-testid="button-delete-account"
            >
              <Trash2 className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently remove your account</p>
              </div>
              <ChevronRight className="h-5 w-5 text-destructive ml-auto" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-6 border-t border-border">
          <p>AfroSphere v1.0.0</p>
          <p className="mt-1">Made with care for African creators</p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
