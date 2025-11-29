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
import { useTranslation } from "@/hooks/useTranslation";
import CommunityGuidelines from "./CommunityGuidelines";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  sw: "Kiswahili",
  yo: "Yoruba",
  ha: "Hausa",
  am: "Amharic",
  xh: "Xhosa",
};

interface SettingsProps {
  onClose: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  userId?: string;
  onTextSizeChange?: (size: "normal" | "large" | "extra-large") => void;
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
  };
  display: {
    darkMode: boolean;
    textSize: "normal" | "large" | "extra-large";
    language: "en" | "sw" | "yo" | "ha" | "am" | "xh";
  };
  content: {
    hideExplicit: boolean;
    mutedWords: boolean;
    restrictedMode: boolean;
  };
}

export default function Settings({ onClose, onLogout, onEditProfile, userId, onTextSizeChange }: SettingsProps) {
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
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
    },
    display: {
      darkMode: true,
      textSize: "normal",
      language: language,
    },
    content: {
      hideExplicit: false,
      mutedWords: false,
      restrictedMode: false,
    },
  });

  const [editMode, setEditMode] = useState<string>("none");
  const [editData, setEditData] = useState({
    email: "",
    phone: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    reportText: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetch(`/api/settings/${userId}`)
        .then(r => r.json())
        .then(data => {
          const loadedLanguage = (data.displayLanguage as "en" | "sw" | "yo" | "ha" | "am" | "xh") || language;
          setSettings(prev => ({
            ...prev,
            account: { privateAccount: data.privateAccount, allowComments: data.allowComments, allowMentions: data.allowMentions },
            notifications: { likes: data.notificationsLikes, comments: data.notificationsComments, follows: data.notificationsFollows, trending: data.notificationsTrending, pushNotifications: data.notificationsPush, emailNotifications: data.notificationsEmail },
            privacy: { downloadData: false, activityStatus: data.privacyActivityStatus },
            display: { ...prev.display, darkMode: data.displayDarkMode, textSize: data.displayTextSize, language: loadedLanguage },
            content: { hideExplicit: data.contentHideExplicit, mutedWords: data.contentMutedWords, restrictedMode: data.contentRestrictedMode },
          }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [userId]);

  useEffect(() => {
    setSettings(prev => ({...prev, display: {...prev.display, language}}));
  }, [language]);

  const handleToggle = (section: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...(settings[section as keyof SettingsSections] as any),
        [key]: value,
      },
    };
    setSettings(newSettings);
    
    // If text size changed, call the callback to update App state
    if (section === "display" && key === "textSize" && onTextSizeChange) {
      onTextSizeChange(value);
    }
    
    if (userId) {
      // If private account is toggled, also update user profile
      if (section === "account" && key === "privateAccount") {
        fetch(`/api/users/${userId}`, { 
          method: 'PATCH', 
          body: JSON.stringify({ isPrivate: value }), 
          headers: { 'Content-Type': 'application/json' } 
        }).then(() => {
          // Update localStorage too
          const storedData = localStorage.getItem("currentUserData");
          if (storedData) {
            const userData = JSON.parse(storedData);
            userData.isPrivate = value;
            localStorage.setItem("currentUserData", JSON.stringify(userData));
            window.dispatchEvent(new Event('userPrivacyChanged'));
          }
        }).catch(e => console.error('Privacy update failed:', e));
      }
      
      const mapped: any = {
        privateAccount: newSettings.account.privateAccount,
        allowComments: newSettings.account.allowComments,
        allowMentions: newSettings.account.allowMentions,
        notificationsLikes: newSettings.notifications.likes,
        notificationsComments: newSettings.notifications.comments,
        notificationsFollows: newSettings.notifications.follows,
        notificationsTrending: newSettings.notifications.trending,
        notificationsPush: newSettings.notifications.pushNotifications,
        notificationsEmail: newSettings.notifications.emailNotifications,
        privacyActivityStatus: newSettings.privacy.activityStatus,
        contentHideExplicit: newSettings.content.hideExplicit,
        contentMutedWords: newSettings.content.mutedWords,
        contentRestrictedMode: newSettings.content.restrictedMode,
        displayDarkMode: newSettings.display.darkMode,
        displayTextSize: newSettings.display.textSize,
        displayLanguage: newSettings.display.language,
      };
      fetch(`/api/settings/${userId}`, { method: 'POST', body: JSON.stringify(mapped), headers: { 'Content-Type': 'application/json' } }).catch(e => console.error('Settings save failed:', e));
    }
  };

  const handleSaveEmail = async () => {
    if (!editData.email && !editData.phone) return;
    try {
      const response = await fetch(`/api/users/${userId}/email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editData.email }),
      });
      if (response.ok) {
        setEditMode("none");
        setEditData({ ...editData, email: "", phone: "" });
      }
    } catch (e) {
      console.error("Failed to save email:", e);
    }
  };

  const handleSavePassword = async () => {
    if (editData.newPassword !== editData.confirmPassword || !editData.newPassword) return;
    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: editData.newPassword, confirmPassword: editData.confirmPassword }),
      });
      if (response.ok) {
        setEditMode("none");
        setEditData({ email: "", phone: "", password: "", newPassword: "", confirmPassword: "", reportText: "" });
      }
    } catch (e) {
      console.error("Failed to update password:", e);
    }
  };

  const SettingButton = ({ icon: Icon, label, description, onClick }: any) => (
    <button
      onClick={onClick}
      className="flex items-start justify-between p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all w-full text-left"
      data-testid={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start gap-3">
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

  const BlockedUsersList = ({ userId }: any) => {
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    useEffect(() => {
      if (userId) {
        fetch(`/api/blocked-users/${userId}`)
          .then(r => r.json())
          .then(data => setBlockedUsers(data || []))
          .catch(() => {});
      }
    }, [userId]);
    
    if (blockedUsers.length === 0) {
      return <p className="text-sm text-foreground">You have not blocked anyone yet. When you block a user, they will not be able to see your profile, posts, or stories.</p>;
    }
    
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold">Blocked Users ({blockedUsers.length})</p>
        {blockedUsers.map((user: any) => (
          <div key={user.id} className="flex items-center justify-between p-2 border border-border/50 rounded-lg bg-card/30">
            <p className="text-sm font-medium">{user.displayName || user.username}</p>
            <Button size="sm" variant="outline" onClick={async () => {
              await fetch(`/api/blocked-users/${userId}/${user.id}`, { method: "DELETE" });
              setBlockedUsers(blockedUsers.filter((u: any) => u.id !== user.id));
            }}>Unblock</Button>
          </div>
        ))}
      </div>
    );
  };

  const renderModal = () => {
    if (editMode === "guidelines") {
      return (
        <CommunityGuidelines
          onClose={() => setEditMode("none")}
        />
      );
    }

    if (editMode === "help") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Help Center</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-primary">Getting Started</p>
                <p className="text-xs leading-relaxed mt-2">Welcome to AfroSphere! Create engaging content by tapping the plus icon on your home feed. Add captions, tags, and select from multiple content categories like Fashion, Music, Art, Culture, and Lifestyle. Connect with creators in your niche and grow your community organically.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Creating Posts</p>
                <p className="text-xs leading-relaxed mt-2">Upload videos or images with descriptions up to 500 characters. Use @mentions to tag other creators and boost engagement. Add location tags to help your content reach creators in your area. Premium creators gain access to advanced analytics and scheduling tools.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Following & Discovery</p>
                <p className="text-xs leading-relaxed mt-2">Browse the Discover section to find trending creators and hashtags. Follow creators whose content resonates with you. Enable notifications to stay updated with new posts from your favorite creators. Create collections to organize and save your favorite content.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Engagement Features</p>
                <p className="text-xs leading-relaxed mt-2">Like, comment, and share posts with your followers. React with emojis on comments for quick responses. Share posts to other social media platforms to expand your reach. Support creators by leaving thoughtful comments on their work.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Profile & Verification</p>
                <p className="text-xs leading-relaxed mt-2">Complete your profile with an avatar, bio, and links to your other social accounts. Consistent engagement and authentic content can lead to creator badges. Update your profile regularly to keep your community engaged and informed about your work.</p>
              </div>
              <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-8">Done</Button>
            </div>
          </div>
        </div>
      );
    }

    if (editMode === "report") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Report a Problem</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <p className="text-sm text-foreground">Help us improve AfroSphere by reporting any technical issues, bugs, or problems you encounter. Please provide detailed information about what went wrong, including when it happened and what you were doing at the time.</p>
            <div>
              <Label className="text-sm font-semibold">Describe the Issue</Label>
              <textarea placeholder="Tell us what happened. Include error messages if any..." className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-32 resize-none mt-2" value={editData.reportText} onChange={(e) => setEditData({...editData, reportText: e.target.value})} />
            </div>
            <p className="text-xs text-muted-foreground">Our support team will review your report within 24-48 hours and reach out if we need more information. Thank you for helping us create a better experience!</p>
            <Button onClick={async () => { if (!editData.reportText) return; try { await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, reportType: "problem", description: editData.reportText }) }); setEditData({...editData, reportText: ""}); setEditMode("none"); } catch (e) { console.error("Report failed:", e); } }} className="w-full bg-primary">Submit Report</Button>
          </div>
        </div>
      );
    }

    if (editMode === "about") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">About AfroSphere</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-lg font-bold text-primary">AfroSphere v1.0.0</p>
                <p className="text-sm leading-relaxed mt-2">AfroSphere is a culturally-centered social platform dedicated to celebrating African creativity, artistry, and talent. We believe every African creator deserves a platform where their voice is heard, their culture is celebrated, and their impact is recognized.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Our Mission</p>
                <p className="text-sm leading-relaxed mt-2">To empower African creators by providing a vibrant digital space where they can share their art, connect with their community, and build sustainable creative careers. We are committed to amplifying African voices in the global creative economy.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">What We Stand For</p>
                <p className="text-sm leading-relaxed mt-2">Authenticity - Real creators, real stories, real impact. Community - Supporting each other in growth. Inclusion - A space for all African creative expressions. Innovation - Cutting-edge features for creators. Sustainability - Building careers, not just followers.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Our Team</p>
                <p className="text-sm leading-relaxed mt-2">Built by passionate creators, developers, and entrepreneurs who believe in the power of African storytelling. We are constantly innovating to bring new features and opportunities to our community.</p>
              </div>
              <p className="text-xs text-muted-foreground">Made with passion for African creators worldwide. All rights reserved 2025 AfroSphere</p>
              <Button onClick={() => setEditMode("none")} className="w-full bg-primary">Close</Button>
            </div>
          </div>
        </div>
      );
    }

    if (editMode === "guidelines") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Community Guidelines</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-primary">Be Respectful and Authentic</p>
                <p className="text-xs leading-relaxed mt-2">Treat all creators with dignity and kindness. Celebrate diversity in creativity styles, backgrounds, and perspectives. Share authentic, original work that represents your true creative voice. Respect cultural traditions and give proper credit when collaborating.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">No Harassment or Hate</p>
                <p className="text-xs leading-relaxed mt-2">Do not engage in bullying, harassment, or hateful behavior toward any individual or group. Discriminatory language based on race, religion, gender, sexuality, or background is strictly prohibited. Report harmful content immediately. We have zero tolerance for hate speech.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Original Content and Rights</p>
                <p className="text-xs leading-relaxed mt-2">Share original creative work or content you have permission to use. Respect intellectual property and artist credits. Do not plagiarize or steal content from other creators. Always ask before using someone else's work, footage, or music.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Safety and Privacy</p>
                <p className="text-xs leading-relaxed mt-2">Protect your personal information and never share sensitive details publicly. Do not share minors' personal information. Respect others' privacy settings and boundaries. Report suspicious accounts or potential scams to our safety team.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Prohibited Content</p>
                <p className="text-xs leading-relaxed mt-2">No explicit adult content, illegal activities, violence, or harmful challenges. Do not promote dangerous substances, self-harm, or misinformation. Do not spam, scam, or use bots to artificially inflate engagement. Violations result in account suspension or permanent ban.</p>
              </div>
              <Button onClick={() => setEditMode("none")} className="w-full bg-primary">I Understand</Button>
            </div>
          </div>
        </div>
      );
    }

    if (editMode === "blocked") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Blocked Users</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <BlockedUsersList userId={userId} />
            <div>
              <p className="text-sm font-semibold">How to Block Someone</p>
              <p className="text-xs text-muted-foreground mt-2">Visit their profile and tap the three dots menu, then select Block User. They will not be notified, but they may notice they cannot find your profile anymore.</p>
            </div>
            <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-8">Done</Button>
          </div>
        </div>
      );
    }

    if (editMode === "reportContent") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Report Content</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <p className="text-sm text-foreground">If you see content that violates our community guidelines, please report it. Your reports help us maintain a safe and respectful community for all creators. All reports are reviewed by our moderation team.</p>
            <div>
              <Label className="text-sm font-semibold">Why are you reporting this post?</Label>
              <textarea placeholder="Tell us why this content should be removed..." className="w-full p-3 border border-border rounded-lg bg-card/50 text-sm min-h-32 resize-none mt-2" value={editData.reportText} onChange={(e) => setEditData({...editData, reportText: e.target.value})} />
            </div>
            <p className="text-xs text-muted-foreground">Common reasons: Harassment, Hate speech, Violence, Explicit content, Spam, Misinformation, Copyright violation</p>
            <p className="text-xs text-muted-foreground">Our team will review your report and take appropriate action within 24 hours. Thank you for helping keep AfroSphere safe!</p>
            <Button onClick={async () => { if (!editData.reportText) return; try { await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, reportType: "content", description: editData.reportText }) }); setEditData({...editData, reportText: ""}); setEditMode("none"); } catch (e) { console.error("Report failed:", e); } }} className="w-full bg-primary">Submit Report</Button>
          </div>
        </div>
      );
    }

    if (editMode === "textSize") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Text Size</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <p className="text-sm text-foreground">Adjust the text size to improve readability on AfroSphere. Your preference will be saved and applied across all pages and posts.</p>
            <p className="text-sm font-semibold">Preview:</p>
            <div className="space-y-2">
              <Button onClick={() => handleToggle("display", "textSize", "normal")} variant={settings.display.textSize === "normal" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span className="text-sm">Normal - Standard comfortable reading size</span></Button>
              <Button onClick={() => handleToggle("display", "textSize", "large")} variant={settings.display.textSize === "large" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span className="text-base">Large - Better for longer reading sessions</span></Button>
              <Button onClick={() => handleToggle("display", "textSize", "extra-large")} variant={settings.display.textSize === "extra-large" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span className="text-lg">Extra Large - Maximum readability</span></Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">You can change this anytime in Settings under Display preferences. Your choice helps create a better viewing experience tailored to you.</p>
            <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Done</Button>
          </div>
        </div>
      );
    }

    if (editMode === "download") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Download Your Data</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-primary">Your Data Rights</p>
                <p className="text-xs leading-relaxed mt-2">AfroSphere respects your data rights. Download a complete copy of your profile information, posts, followers list, engagement history, and account settings in a portable format.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">What is Included</p>
                <p className="text-xs leading-relaxed mt-2">Profile information, display name, bio, location, website. All your posts and content. Follower and following lists. Comments and engagement history. Account settings and preferences. Media files you have uploaded.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Processing Time</p>
                <p className="text-xs leading-relaxed mt-2">Your data download will be prepared within 24-48 hours. You will receive an email with a secure download link valid for 14 days. Download includes all data up to the request date.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Privacy and Security</p>
                <p className="text-xs leading-relaxed mt-2">Your data file is encrypted and password-protected. Only you can access it. We recommend storing it securely. Use this feature to migrate to another platform, create backups, or for personal records.</p>
              </div>
              <Button onClick={() => { setEditMode("none"); }} className="w-full bg-primary">Request Download</Button>
            </div>
          </div>
        </div>
      );
    }

    if (editMode === "sessions") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Active Sessions</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <p className="text-sm text-foreground">Manage all devices where you are logged into AfroSphere. See where and when you accessed your account for security purposes.</p>
            <div>
              <p className="text-sm font-semibold">Currently Active</p>
              <div className="bg-card/50 border border-primary/20 p-3 rounded-lg mt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">This Device</p>
                    <p className="text-xs text-muted-foreground mt-1">Web Browser</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary font-semibold">Now</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Active: Last 5 minutes ago</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Logout Other Sessions</p>
              <p className="text-xs text-muted-foreground mt-2">Tap Logout All below to end all active sessions except this device. You will need to log in again on other devices.</p>
            </div>
            <Button onClick={() => setEditMode("none")} className="w-full bg-primary mt-6">Logout All Sessions</Button>
          </div>
        </div>
      );
    }

    if (editMode === "2fa") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Two-Factor Authentication</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-primary">Enhanced Security</p>
                <p className="text-xs leading-relaxed mt-2">Two-Factor Authentication adds an extra layer of security to your account. When enabled, you will need both your password and a verification code to log in.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">How It Works</p>
                <p className="text-xs leading-relaxed mt-2">Step 1: Enter your password as usual. Step 2: We send a 6-digit code to your registered phone. Step 3: Enter the code to complete login. Step 4: Your account is now secure from unauthorized access.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Why Use 2FA</p>
                <p className="text-xs leading-relaxed mt-2">Protects against hacked passwords, prevents account takeover, keeps your content and followers safe, and takes less than 30 seconds per login.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Getting Started</p>
                <p className="text-xs leading-relaxed mt-2">Enable 2FA using your phone number or authenticator app. Save backup codes in a safe place for emergency access. You can disable it anytime from settings.</p>
              </div>
              <Button onClick={() => { setEditMode("none"); }} className="w-full bg-primary">Enable 2FA</Button>
            </div>
          </div>
        </div>
      );
    }

    if (editMode === "language") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">{t("settings.language")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setEditMode("none")}><X className="h-5 w-5" /></Button>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
            <p className="text-sm text-foreground">Choose your preferred language for AfroSphere. Your selection will be saved and applied across the app.</p>
            <div className="space-y-2 mt-4">
              <Button onClick={() => { setLanguage("en"); handleToggle("display", "language", "en"); toast({ title: "Language Updated", description: "Your language preference has been changed to English" }); setTimeout(() => setEditMode("none"), 200); }} variant={language === "en" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>English</span></Button>
              <Button onClick={() => { setLanguage("sw"); handleToggle("display", "language", "sw"); toast({ title: "Language Updated", description: "Your language preference has been changed to Kiswahili" }); setTimeout(() => setEditMode("none"), 200); }} variant={language === "sw" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Kiswahili (East Africa)</span></Button>
              <Button onClick={() => { setLanguage("yo"); handleToggle("display", "language", "yo"); toast({ title: "Language Updated", description: "Your language preference has been changed to Yoruba" }); setTimeout(() => setEditMode("none"), 200); }} variant={language === "yo" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Yoruba (West Africa)</span></Button>
              <Button onClick={() => { setLanguage("ha"); handleToggle("display", "language", "ha"); toast({ title: "Language Updated", description: "Your language preference has been changed to Hausa" }); setTimeout(() => setEditMode("none"), 200); }} variant={language === "ha" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Hausa (West Africa)</span></Button>
              <Button onClick={() => { setLanguage("am"); handleToggle("display", "language", "am"); toast({ title: "Language Updated", description: "Your language preference has been changed to Amharic" }); setTimeout(() => setEditMode("none"), 200); }} variant={language === "am" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Amharic (Ethiopia)</span></Button>
              <Button onClick={() => { setLanguage("xh"); handleToggle("display", "language", "xh"); toast({ title: "Language Updated", description: "Your language preference has been changed to Xhosa" }); setTimeout(() => setEditMode("none"), 200); }} variant={language === "xh" ? "default" : "outline"} className="w-full justify-start h-auto py-3"><span>Xhosa (South Africa)</span></Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">AfroSphere is proud to support languages spoken across the African continent. Coming soon: more languages including Igbo, Zulu, Somali, and Oromo.</p>
          </div>
        </div>
      );
    }

    if (editMode === "email") {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Email and Phone</h2>
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

    return null;
  };

  if (editMode !== "none") {
    return renderModal();
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
              icon={Lock}
              label="Password"
              description="Change your password"
              onClick={() => setEditMode("password")}
            />
            <SettingToggle
              icon={Smartphone}
              label="Private Account"
              description="Only approved followers can see your posts"
              section="account"
              settingKey="privateAccount"
            />
            <SettingToggle
              icon={Users}
              label="Allow Comments"
              description="Let others comment on your posts"
              section="account"
              settingKey="allowComments"
            />
            <SettingToggle
              icon={Bell}
              label="Allow Mentions"
              description="Allow people to mention you in posts"
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
              description="Notify me when someone likes my post"
              section="notifications"
              settingKey="likes"
            />
            <SettingToggle
              icon={Users}
              label="Comments"
              description="Notify me when someone comments"
              section="notifications"
              settingKey="comments"
            />
            <SettingToggle
              icon={Users}
              label="New Followers"
              description="Notify me when someone follows me"
              section="notifications"
              settingKey="follows"
            />
            <SettingToggle
              icon={Share2}
              label="Trending Posts"
              description="Notify me about trending content"
              section="notifications"
              settingKey="trending"
            />
            <SettingToggle
              icon={Bell}
              label="Push Notifications"
              description="Receive notifications on your device"
              section="notifications"
              settingKey="pushNotifications"
            />
            <SettingToggle
              icon={Mail}
              label="Email Notifications"
              description="Receive email updates"
              section="notifications"
              settingKey="emailNotifications"
            />
          </div>
        </div>

        {/* PRIVACY SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Privacy</h3>
          <div className="space-y-2">
            <SettingToggle
              icon={Eye}
              label="Activity Status"
              description="Show when you are active"
              section="privacy"
              settingKey="activityStatus"
            />
          </div>
        </div>

        {/* DISPLAY SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Display</h3>
          <div className="space-y-2">
            <div className="flex items-start justify-between p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all" data-testid="setting-dark-mode">
              <div className="flex items-start gap-3">
                <Moon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <Label htmlFor="display-darkMode" className="text-sm font-medium cursor-pointer">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Use dark theme for the app</p>
                </div>
              </div>
              <Switch
                id="display-darkMode"
                checked={settings.display.darkMode}
                onCheckedChange={(value) => {
                  handleToggle("display", "darkMode", value);
                  localStorage.setItem("darkMode", String(value));
                  if (value) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                }}
                data-testid="switch-dark-mode"
              />
            </div>
            <SettingButton
              icon={Volume2}
              label="Text Size"
              description="Adjust text size for readability"
              onClick={() => setEditMode("textSize")}
            />
            <SettingButton
              icon={Globe}
              label="Language"
              description="Change your preferred language"
              onClick={() => setEditMode("language")}
            />
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Content</h3>
          <div className="space-y-2">
            <SettingToggle
              icon={AlertCircle}
              label="Hide Explicit Content"
              description="Filter sensitive content from your feed"
              section="content"
              settingKey="hideExplicit"
            />
            <SettingToggle
              icon={Volume2}
              label="Muted Words"
              description="Hide content with specific words"
              section="content"
              settingKey="mutedWords"
            />
            <SettingToggle
              icon={Shield}
              label="Restricted Mode"
              description="Limited content recommendations"
              section="content"
              settingKey="restrictedMode"
            />
          </div>
        </div>

        {/* SUPPORT SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Support</h3>
          <div className="space-y-2">
            <SettingButton
              icon={HelpCircle}
              label="Help Center"
              description="Get help and learn how to use AfroSphere"
              onClick={() => setEditMode("help")}
            />
            <SettingButton
              icon={Info}
              label="About AfroSphere"
              description="Learn more about our mission"
              onClick={() => setEditMode("about")}
            />
            <SettingButton
              icon={Shield}
              label="Community Guidelines"
              description="Our rules for a safe community"
              onClick={() => setEditMode("guidelines")}
            />
            <SettingButton
              icon={AlertCircle}
              label="Report a Problem"
              description="Tell us if something is not working"
              onClick={() => { setEditData({ ...editData, reportText: "" }); setEditMode("report"); }}
            />
            <SettingButton
              icon={Lock}
              label="Blocked Users"
              description="Manage your blocked list"
              onClick={() => setEditMode("blocked")}
            />
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Security</h3>
          <div className="space-y-2">
            <SettingButton
              icon={Smartphone}
              label="Active Sessions"
              description="View your logged-in devices"
              onClick={() => setEditMode("sessions")}
            />
            <SettingButton
              icon={Lock}
              label="Two-Factor Authentication"
              description="Add extra security to your account"
              onClick={() => setEditMode("2fa")}
            />
            <SettingButton
              icon={Trash2}
              label="Download Your Data"
              description="Get a copy of your data"
              onClick={() => setEditMode("download")}
            />
          </div>
        </div>

        {/* DANGER ZONE */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Danger Zone</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 px-4 border-destructive/50 hover:bg-destructive/5"
              onClick={() => {
                localStorage.removeItem("currentUserId");
                localStorage.removeItem("currentUserData");
                localStorage.removeItem("selectedLanguage");
                if (onLogout) {
                  onLogout();
                } else {
                  window.location.href = "/";
                }
              }}
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
              onClick={async () => {
                if (window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
                  try {
                    const response = await fetch(`/api/users/${userId}/delete`, { method: "POST" });
                    if (response.ok) {
                      localStorage.removeItem("currentUserId");
                      localStorage.removeItem("currentUserData");
                      localStorage.removeItem("selectedLanguage");
                      toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
                      if (onLogout) {
                        onLogout();
                      } else {
                        window.location.href = "/";
                      }
                    } else {
                      toast({ title: "Error", description: "Failed to delete account. Please try again." });
                    }
                  } catch (e) {
                    console.error("Failed to delete account:", e);
                    toast({ title: "Error", description: "Failed to delete account. Please try again." });
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
