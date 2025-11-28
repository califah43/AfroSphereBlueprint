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
  const [scrollPosition, setScrollPosition] = useState(0);
  const { toast } = useToast();
  const userId = localStorage.getItem("currentUserId") || "default-user";
  const currentUserData = localStorage.getItem("currentUserData") ? JSON.parse(localStorage.getItem("currentUserData")!) : {};

  // Save scroll position when opening a modal, restore when closing
  useEffect(() => {
    if (editMode !== "none") {
      // Save scroll position when opening a modal
      const settingsContainer = document.querySelector("[data-testid='settings-container']");
      if (settingsContainer) {
        setScrollPosition(settingsContainer.scrollTop);
      }
    } else if (scrollPosition > 0) {
      // Restore scroll position when closing modal
      const settingsContainer = document.querySelector("[data-testid='settings-container']");
      if (settingsContainer) {
        setTimeout(() => {
          settingsContainer.scrollTop = scrollPosition;
        }, 0);
      }
    }
  }, [editMode]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`/api/settings/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setSettings({
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
          });
        }
      } catch (error) {
        console.log("Using default settings");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [userId]);

  const handleToggle = async (section: keyof SettingsSections, settingKey: string, value: boolean) => {
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

      if (!res.ok) {
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
        title: "Error",
        description: "Unable to save settings",
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

  // Early modals - professional content
  if (editMode === "help") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Help Center</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-4"><p className="text-sm font-bold text-primary">Getting Started</p><p className="text-xs leading-relaxed">Welcome to AfroSphere! Create engaging content by tapping the plus icon on your home feed. Add captions, tags, and select from multiple content categories like Fashion, Music, Art, Culture, and Lifestyle. Connect with creators in your niche and grow your community organically.</p><p className="text-sm font-bold text-primary mt-4">Creating Posts</p><p className="text-xs leading-relaxed">Upload videos or images with descriptions up to 500 characters. Use @mentions to tag other creators and boost engagement. Add location tags to help your content reach creators in your area. Premium creators gain access to advanced analytics and scheduling tools.</p><p className="text-sm font-bold text-primary mt-4">Following & Discovery</p><p className="text-xs leading-relaxed">Browse the Discover section to find trending creators and hashtags. Follow creators whose content resonates with you. Enable notifications to stay updated with new posts from your favorite creators. Create collections to organize and save your favorite content.</p><p className="text-sm font-bold text-primary mt-4">Engagement Features</p><p className="text-xs leading-relaxed">Like, comment, and share posts with your followers. React with emojis on comments for quick responses. Share posts to other social media platforms to expand your reach. Support creators by leaving thoughtful comments on their work.</p><p className="text-sm font-bold text-primary mt-4">Profile & Verification</p><p className="text-xs leading-relaxed">Complete your profile with an avatar, bio, and links to your other social accounts. Consistent engagement and authentic content can lead to creator badges. Update your profile regularly to keep your community engaged and informed about your work.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-8">Done</Button></div></div></div>;
  }

  if (editMode === "report") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Report a Problem</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm text-foreground">Help us improve AfroSphere by reporting any technical issues, bugs, or problems you encounter. Please provide detailed information about what went wrong, including when it happened and what you were doing at the time.</p><Label className="text-sm font-semibold">Describe the Issue</Label><textarea placeholder="Tell us what happened. Include error messages if any..." className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-32 resize-none" value={editData.reportText} onChange={(e) => setEditData({...editData, reportText: e.target.value})} /><p className="text-xs text-muted-foreground">Our support team will review your report within 24-48 hours and reach out if we need more information. Thank you for helping us create a better experience!</p><Button onClick={() => { if (editData.reportText) { setEditData({...editData, reportText: ""}); setEditMode("none"); } }} className="w-full bg-primary">Submit Report</Button></div></div></div>;
  }

  if (editMode === "about") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">About AfroSphere</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-4"><p className="text-lg font-bold text-primary">AfroSphere v1.0.0</p><p className="text-sm leading-relaxed">AfroSphere is a culturally-centered social platform dedicated to celebrating African creativity, artistry, and talent. We believe every African creator deserves a platform where their voice is heard, their culture is celebrated, and their impact is recognized.</p><p className="text-sm font-bold text-primary mt-4">Our Mission</p><p className="text-sm leading-relaxed">To empower African creators by providing a vibrant digital space where they can share their art, connect with their community, and build sustainable creative careers. We're committed to amplifying African voices in the global creative economy.</p><p className="text-sm font-bold text-primary mt-4">What We Stand For</p><p className="text-sm leading-relaxed">• Authenticity - Real creators, real stories, real impact • Community - Supporting each other in growth • Inclusion - A space for all African creative expressions • Innovation - Cutting-edge features for creators • Sustainability - Building careers, not just followers</p><p className="text-sm font-bold text-primary mt-4">Our Team</p><p className="text-sm leading-relaxed">Built by passionate creators, developers, and entrepreneurs who believe in the power of African storytelling. We're constantly innovating to bring new features and opportunities to our community.</p><p className="text-xs text-muted-foreground mt-4">Made with passion for African creators worldwide. All rights reserved © 2025 AfroSphere</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Close</Button></div></div></div>;
  }

  if (editMode === "guidelines") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Community Guidelines</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-4"><p className="text-sm font-bold text-primary">Be Respectful & Authentic</p><p className="text-xs leading-relaxed">Treat all creators with dignity and kindness. Celebrate diversity in creativity styles, backgrounds, and perspectives. Share authentic, original work that represents your true creative voice. Respect cultural traditions and give proper credit when collaborating.</p><p className="text-sm font-bold text-primary mt-3">No Harassment or Hate</p><p className="text-xs leading-relaxed">Don't engage in bullying, harassment, or hateful behavior toward any individual or group. Discriminatory language based on race, religion, gender, sexuality, or background is strictly prohibited. Report harmful content immediately. We have zero tolerance for hate speech.</p><p className="text-sm font-bold text-primary mt-3">Original Content & Rights</p><p className="text-xs leading-relaxed">Share original creative work or content you have permission to use. Respect intellectual property and artist credits. Don't plagiarize or steal content from other creators. Always ask before using someone else's work, footage, or music.</p><p className="text-sm font-bold text-primary mt-3">Safety & Privacy</p><p className="text-xs leading-relaxed">Protect your personal information and never share sensitive details publicly. Don't share minors' personal information. Respect others' privacy settings and boundaries. Report suspicious accounts or potential scams to our safety team.</p><p className="text-sm font-bold text-primary mt-3">Prohibited Content</p><p className="text-xs leading-relaxed">No explicit adult content, illegal activities, violence, or harmful challenges. Don't promote dangerous substances, self-harm, or misinformation. Don't spam, scam, or use bots to artificially inflate engagement. Violations result in account suspension or permanent ban.</p><p className="text-sm font-bold text-primary mt-3">Report & Support</p><p className="text-xs leading-relaxed">See something wrong? Report it using the flag button on any post or profile. Our moderation team reviews reports 24/7. If you're struggling, reach out to our support team. Community members looking out for each other make AfroSphere great.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">I Understand</Button></div></div></div>;
  }

  if (editMode === "blocked") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Blocked Users</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm text-foreground">You haven't blocked anyone yet. When you block a user, they won't be able to see your profile, posts, or stories. Blocked users cannot send you direct messages or find you through search.</p><p className="text-sm font-semibold mt-4">How to Block Someone</p><p className="text-xs text-muted-foreground">Visit their profile and tap the three dots menu, then select 'Block User'. They won't be notified, but they may notice they can't find your profile anymore.</p><p className="text-sm font-semibold mt-4">Unblocking Users</p><p className="text-xs text-muted-foreground">Go to Settings > Blocked Users, find the person you want to unblock, and tap 'Unblock'. They'll be able to see your profile again, but they still won't have access to your chat history.</p><p className="text-sm font-semibold mt-4">Privacy & Safety</p><p className="text-xs text-muted-foreground">Blocking is a private action designed to help you maintain control of your space on AfroSphere. Use it whenever you feel uncomfortable with someone's behavior or content.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-8">Done</Button></div></div></div>;
  }

  if (editMode === "reportContent") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Report Content</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm text-foreground">If you see content that violates our community guidelines, please report it. Your reports help us maintain a safe and respectful community for all creators. All reports are reviewed by our moderation team.</p><Label className="text-sm font-semibold">Why are you reporting this post?</Label><textarea placeholder="Tell us why this content should be removed or reviewed..." className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-32 resize-none" value={editData.reportText} onChange={(e) => setEditData({...editData, reportText: e.target.value})} /><p className="text-xs text-muted-foreground mt-2">Common reasons: Harassment • Hate speech • Violence • Explicit content • Spam • Misinformation • Copyright violation</p><p className="text-xs text-muted-foreground mt-3">Our team will review your report and take appropriate action within 24 hours. Thank you for helping keep AfroSphere safe!</p><Button onClick={() => { if (editData.reportText) { setEditData({...editData, reportText: ""}); setEditMode("none"); } }} className="w-full bg-primary">Submit Report</Button></div></div></div>;
  }

  if (editMode === "textSize") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Text Size</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-4"><p className="text-sm text-foreground">Adjust the text size to improve readability on AfroSphere. Your preference will be saved and applied across all pages and posts.</p><p className="text-sm font-semibold">Preview:</p><div className="space-y-2"><Button onClick={() => { setSettings({...settings, display: {...settings.display, textSize: "normal"}}); handleToggle("display", "textSize", true); }} variant={settings.display.textSize === "normal" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span className="text-sm">Normal - Standard comfortable reading size</span></Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, textSize: "large"}}); handleToggle("display", "textSize", true); }} variant={settings.display.textSize === "large" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span className="text-base">Large - Better for longer reading sessions</span></Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, textSize: "extra-large"}}); handleToggle("display", "textSize", true); }} variant={settings.display.textSize === "extra-large" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span className="text-lg">Extra Large - Maximum readability</span></Button></div><p className="text-xs text-muted-foreground mt-4">You can change this anytime in Settings under Display preferences. Your choice helps create a better viewing experience tailored to you.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Done</Button></div></div></div>;
  }

  if (editMode === "download") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Download Your Data</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm font-bold text-primary">Your Data Rights</p><p className="text-xs leading-relaxed">AfroSphere respects your data rights. Download a complete copy of your profile information, posts, followers list, engagement history, and account settings in a portable format.</p><p className="text-sm font-bold text-primary mt-4">What's Included</p><p className="text-xs leading-relaxed">• Profile information (display name, bio, location, website) • All your posts and content • Follower/following lists • Comments and engagement history • Account settings and preferences • Media files you've uploaded</p><p className="text-sm font-bold text-primary mt-4">Processing Time</p><p className="text-xs leading-relaxed">Your data download will be prepared within 24-48 hours. You'll receive an email with a secure download link valid for 14 days. Download includes all data up to the request date.</p><p className="text-sm font-bold text-primary mt-4">Privacy & Security</p><p className="text-xs leading-relaxed">Your data file is encrypted and password-protected. Only you can access it. We recommend storing it securely. Use this feature to migrate to another platform, create backups, or for personal records.</p><Button onClick={() => { setEditMode("none"); }} className="w-full bg-primary">Request Download</Button></div></div></div>;
  }

  if (editMode === "sessions") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Active Sessions</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm text-foreground">Manage all devices where you're logged into AfroSphere. See where and when you accessed your account for security purposes.</p><p className="text-sm font-semibold mt-4">Currently Active</p><div className="bg-card/50 border border-primary/20 p-3 rounded-lg"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-foreground">This Device</p><p className="text-xs text-muted-foreground mt-1">Safari on macOS</p></div><div className="text-right"><p className="text-xs text-primary font-semibold">Now</p></div></div><p className="text-xs text-muted-foreground mt-2">Active: Last 5 minutes ago</p></div><p className="text-sm font-semibold mt-4">Logout Other Sessions</p><p className="text-xs text-muted-foreground">Tap 'Logout All' below to end all active sessions except this device. You'll need to log in again on other devices.</p><p className="text-xs text-muted-foreground mt-3 text-orange-600">For security, logout from unknown devices or if you suspect unauthorized access.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Logout All Sessions</Button></div></div></div>;
  }

  if (editMode === "2fa") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Two-Factor Authentication</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm font-bold text-primary">Enhanced Security</p><p className="text-xs leading-relaxed">Two-Factor Authentication (2FA) adds an extra layer of security to your account. When enabled, you will need both your password and a verification code to log in.</p><p className="text-sm font-bold text-primary mt-4">How It Works</p><p className="text-xs leading-relaxed">Step 1: Enter your password as usual. Step 2: We send a 6-digit code to your registered phone. Step 3: Enter the code to complete login. Step 4: Your account is now secure from unauthorized access.</p><p className="text-sm font-bold text-primary mt-4">Why Use 2FA</p><p className="text-xs leading-relaxed">Protects against hacked passwords, prevents account takeover, keeps your content and followers safe, and takes less than 30 seconds per login.</p><p className="text-sm font-bold text-primary mt-4">Getting Started</p><p className="text-xs leading-relaxed">Enable 2FA using your phone number or authenticator app. Save backup codes in a safe place for emergency access. You can disable it anytime from settings.</p><Button onClick={() => { setEditMode("none"); }} className="w-full bg-primary">Enable 2FA</Button></div></div></div>;
  }

  if (editMode === "language") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Language</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4"><div className="space-y-3"><p className="text-sm text-foreground">Choose your preferred language for AfroSphere. Your selection will be saved and applied across the app.</p><div className="space-y-2 mt-4"><Button onClick={() => { setSettings({...settings, display: {...settings.display, language: "en"}}); handleToggle("display", "language", true); setEditMode("none"); }} variant={settings.display.language === "en" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>English (Global)</span></Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, language: "es"}}); handleToggle("display", "language", true); setEditMode("none"); }} variant={settings.display.language === "es" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Espanol (Spanish)</span></Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, language: "fr"}}); handleToggle("display", "language", true); setEditMode("none"); }} variant={settings.display.language === "fr" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Francais (French)</span></Button></div><p className="text-xs text-muted-foreground mt-6">More languages coming soon! We are working on Swahili, Yoruba, Hausa, and other African languages to better serve our community.</p></div></div></div>;
  }

  if (editMode === "email") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Email & Phone</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 space-y-4"><div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} /></div><div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="+234 123 456 7890" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} /></div><Button onClick={handleSaveEmail} className="w-full bg-primary">Save Changes</Button></div></div>;
  }

  if (editMode === "password") {
    return <div className="fixed inset-0 bg-background z-50 overflow-y-auto"><div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10"><h2 className="text-lg font-bold">Change Password</h2><Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button></div><div className="max-w-md mx-auto px-4 py-6 space-y-4"><div className="space-y-2"><Label>Current Password</Label><Input type="password" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} /></div><div className="space-y-2"><Label>New Password</Label><Input type="password" value={editData.newPassword} onChange={(e) => setEditData({...editData, newPassword: e.target.value})} /></div><div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={editData.confirmPassword} onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})} /></div><Button onClick={handleSavePassword} className="w-full bg-primary">Update Password</Button></div></div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto" data-testid="settings-container">
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
              onClick={() => console.log("Delete account")}
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
