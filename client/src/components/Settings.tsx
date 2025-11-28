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
    return <Modal title="Help Center"><div className="space-y-3"><p className="text-sm"><strong>Getting Started</strong></p><p className="text-xs text-muted-foreground">Learn how to create posts, follow creators, and explore content.</p><p className="text-sm mt-4"><strong>Common Questions</strong></p><p className="text-xs text-muted-foreground">How to edit my profile • How to report content • Privacy settings</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Close</Button></div></Modal>;
  }

  if (editMode === "report") {
    return <Modal title="Report a Problem"><div className="space-y-3"><textarea placeholder="Describe your issue..." className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-24" value={editData.reportText} onChange={(e) => setEditData({...editData, reportText: e.target.value})} /><Button onClick={() => { if (editData.reportText) { setEditMode("none"); } }} className="w-full bg-primary">Send Report</Button></div></Modal>;
  }

  if (editMode === "about") {
    return <Modal title="About AfroSphere"><div className="space-y-4"><p className="text-sm"><strong>AfroSphere v1.0.0</strong></p><p className="text-xs text-muted-foreground">Africa's creative home for emerging artists, musicians, and cultural creators.</p><p className="text-xs text-muted-foreground mt-2">Built with passion for African talent • Powered by community • Made for creators</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Close</Button></div></Modal>;
  }

  if (editMode === "guidelines") {
    return <Modal title="Community Guidelines"><div className="space-y-3"><p className="text-xs"><strong>Be Respectful</strong></p><p className="text-xs text-muted-foreground">Treat all creators with dignity and kindness.</p><p className="text-xs mt-2"><strong>No Harassment</strong></p><p className="text-xs text-muted-foreground">Don't engage in bullying or hateful behavior.</p><p className="text-xs mt-2"><strong>Original Content</strong></p><p className="text-xs text-muted-foreground">Share authentic, creative work. Respect others' rights.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">I Understand</Button></div></Modal>;
  }

  if (editMode === "blocked") {
    return <Modal title="Blocked Users"><div className="space-y-3"><p className="text-xs text-muted-foreground">You currently have no blocked users.</p><p className="text-xs text-muted-foreground mt-2">Blocked users cannot see your posts or contact you.</p><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Done</Button></div></Modal>;
  }

  if (editMode === "reportContent") {
    return <Modal title="Report Content"><div className="space-y-3"><textarea placeholder="Why are you reporting this post?..." className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-24" value={editData.reportText} onChange={(e) => setEditData({...editData, reportText: e.target.value})} /><Button onClick={() => { if (editData.reportText) { setEditMode("none"); } }} className="w-full bg-primary">Submit Report</Button></div></Modal>;
  }

  if (editMode === "textSize") {
    return <Modal title="Text Size"><div className="space-y-3"><div className="flex gap-2"><Button onClick={() => { setSettings({...settings, display: {...settings.display, textSize: "normal"}}); handleToggle("display", "textSize", true); }} variant={settings.display.textSize === "normal" ? "default" : "outline"} className="flex-1">Normal</Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, textSize: "large"}}); handleToggle("display", "textSize", true); }} variant={settings.display.textSize === "large" ? "default" : "outline"} className="flex-1">Large</Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, textSize: "extra-large"}}); handleToggle("display", "textSize", true); }} variant={settings.display.textSize === "extra-large" ? "default" : "outline"} className="flex-1">XL</Button></div><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Done</Button></div></Modal>;
  }

  if (editMode === "download") {
    return <Modal title="Download Your Data"><div className="space-y-3"><p className="text-xs text-muted-foreground">Get a copy of all your profile data, posts, and activity.</p><Button onClick={() => { setEditMode("none"); }} className="w-full bg-primary">Download Now</Button></div></Modal>;
  }

  if (editMode === "sessions") {
    return <Modal title="Active Sessions"><div className="space-y-3"><div className="bg-card/50 border border-border/50 p-3 rounded"><p className="text-xs font-semibold">This Device</p><p className="text-xs text-muted-foreground">Last active now</p></div><Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Close</Button></div></Modal>;
  }

  if (editMode === "2fa") {
    return <Modal title="Two-Factor Authentication"><div className="space-y-3"><p className="text-xs text-muted-foreground">Add an extra security layer to your account with 2FA.</p><Button onClick={() => { setEditMode("none"); }} className="w-full bg-primary">Enable 2FA</Button></div></Modal>;
  }

  if (editMode === "language") {
    return <Modal title="Language"><div className="space-y-3"><div className="flex flex-col gap-2"><Button onClick={() => { setSettings({...settings, display: {...settings.display, language: "en"}}); handleToggle("display", "language", true); setEditMode("none"); }} variant={settings.display.language === "en" ? "default" : "outline"} className="w-full">English</Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, language: "es"}}); handleToggle("display", "language", true); setEditMode("none"); }} variant={settings.display.language === "es" ? "default" : "outline"} className="w-full">Español</Button><Button onClick={() => { setSettings({...settings, display: {...settings.display, language: "fr"}}); handleToggle("display", "language", true); setEditMode("none"); }} variant={settings.display.language === "fr" ? "default" : "outline"} className="w-full">Français</Button></div></div></Modal>;
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
