import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

export default function Settings({ onClose, onLogout }: SettingsProps) {
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
  const { toast } = useToast();
  const userId = localStorage.getItem("currentUserId") || "default-user";

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

  const handleToggle = async (section: keyof SettingsSections, key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);

    setSaving(true);
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
          title: "Settings saved",
          description: "Your preferences have been updated",
          className: "border-primary/20 bg-card",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive",
        });
        setSettings(settings);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Connection Error",
        description: "Unable to save settings. Please try again.",
        variant: "destructive",
      });
      setSettings(settings);
    } finally {
      setSaving(false);
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

  const SettingToggle = ({ icon: Icon, label, description, section, key }: any) => {
    const currentValue = (settings[section as keyof SettingsSections] as any)[key];
    return (
      <div className="flex items-start justify-between p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all" data-testid={`setting-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <Label htmlFor={`${section}-${key}`} className="text-sm font-medium cursor-pointer">{label}</Label>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <Switch
          id={`${section}-${key}`}
          checked={currentValue}
          onCheckedChange={(value) => handleToggle(section, key, value)}
          data-testid={`switch-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
      </div>
    );
  };

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
              onClick={() => console.log("Edit email/phone")}
            />
            <SettingButton
              icon={Users}
              label="Edit Profile"
              description="Update username, display name, bio"
              onClick={() => console.log("Edit profile")}
            />
            <SettingButton
              icon={Lock}
              label="Change Password"
              description="Update your account security"
              onClick={() => console.log("Change password")}
            />
            <SettingToggle
              icon={Eye}
              label="Private Account"
              description="Only followers can see your posts"
              section="account"
              key="privateAccount"
            />
            <SettingToggle
              icon={Bell}
              label="Allow Comments"
              description="Anyone can comment on posts"
              section="account"
              key="allowComments"
            />
            <SettingToggle
              icon={Users}
              label="Allow Mentions"
              description="Allow others to mention you"
              section="account"
              key="allowMentions"
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
              key="likes"
            />
            <SettingToggle
              icon={Info}
              label="Comments"
              description="Get notified on new comments"
              section="notifications"
              key="comments"
            />
            <SettingToggle
              icon={Users}
              label="New Followers"
              description="Get notified when someone follows you"
              section="notifications"
              key="follows"
            />
            <SettingToggle
              icon={Share2}
              label="Trending Posts"
              description="Be notified of trending content"
              section="notifications"
              key="trending"
            />
            <SettingToggle
              icon={Bell}
              label="Push Notifications"
              description="Receive push notifications"
              section="notifications"
              key="pushNotifications"
            />
            <SettingToggle
              icon={Mail}
              label="Email Notifications"
              description="Receive email digests"
              section="notifications"
              key="emailNotifications"
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
              onClick={() => console.log("View blocked users")}
            />
            <SettingToggle
              icon={Eye}
              label="Activity Status"
              description="Show when you're online"
              section="privacy"
              key="activityStatus"
            />
            <SettingToggle
              icon={CheckCircle2}
              label="Read Receipts"
              description="Let people see when you read messages"
              section="privacy"
              key="readReceipts"
            />
            <SettingButton
              icon={AlertCircle}
              label="Report Content"
              description="Report inappropriate posts"
              onClick={() => console.log("Report content")}
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
              key="hideExplicit"
            />
            <SettingToggle
              icon={Volume2}
              label="Muted Words"
              description="Hide posts with certain words"
              section="content"
              key="mutedWords"
            />
            <SettingToggle
              icon={Shield}
              label="Restricted Mode"
              description="Hide mature content"
              section="content"
              key="restrictedMode"
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
              key="darkMode"
            />
            <SettingButton
              icon={Globe}
              label="Language"
              description={`Current: ${settings.display.language === 'en' ? 'English' : settings.display.language === 'es' ? 'Español' : 'Français'}`}
              onClick={() => console.log("Change language")}
            />
            <SettingButton
              icon={Sun}
              label="Text Size"
              description={`Current: ${settings.display.textSize === 'normal' ? 'Normal' : settings.display.textSize === 'large' ? 'Large' : 'Extra Large'}`}
              onClick={() => console.log("Adjust text size")}
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
              onClick={() => console.log("Download data")}
            />
            <SettingButton
              icon={Shield}
              label="Active Sessions"
              description="View and manage logged-in devices"
              onClick={() => console.log("View sessions")}
            />
            <SettingButton
              icon={AlertCircle}
              label="Two-Factor Authentication"
              description="Add extra security to your account"
              onClick={() => console.log("Enable 2FA")}
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
              onClick={() => console.log("Open help")}
            />
            <SettingButton
              icon={AlertCircle}
              label="Report a Problem"
              description="Tell us what's wrong"
              onClick={() => console.log("Report issue")}
            />
            <SettingButton
              icon={Info}
              label="About AfroSphere"
              description="Version 1.0.0 • Learn more about us"
              onClick={() => console.log("About")}
            />
            <SettingButton
              icon={Globe}
              label="Community Guidelines"
              description="Our values and rules"
              onClick={() => console.log("Guidelines")}
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
