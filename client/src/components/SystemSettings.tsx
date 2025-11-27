import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Lock, Shield, Settings, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemSettingsProps {
  onBack?: () => void;
}

export default function SystemSettings({ onBack }: SystemSettingsProps) {
  // Authentication Settings
  const [signupsEnabled, setSignupsEnabled] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [blockedEmails, setBlockedEmails] = useState(["spam@example.com", "test@temp.com"]);
  const [blockedUsernames, setBlockedUsernames] = useState(["admin", "root", "bot"]);
  const [newBlockedEmail, setNewBlockedEmail] = useState("");
  const [newBlockedUsername, setNewBlockedUsername] = useState("");

  // Content Settings
  const [maxVideoLength, setMaxVideoLength] = useState(300);
  const [maxImageSize, setMaxImageSize] = useState(50);
  const [allowedFormats, setAllowedFormats] = useState(["mp4", "mov", "avi"]);

  // Security Settings
  const [autoModeration, setAutoModeration] = useState(true);

  // AI & Automation Settings
  const [oriAIEnabled, setOriAIEnabled] = useState(true);
  const [autoModerationEnabled, setAutoModerationEnabled] = useState(true);
  const [filteringSensitivity, setFilteringSensitivity] = useState("medium");
  const [contentReviewAI, setContentReviewAI] = useState(true);

  const handleAddBlockedEmail = () => {
    if (newBlockedEmail && !blockedEmails.includes(newBlockedEmail)) {
      setBlockedEmails([...blockedEmails, newBlockedEmail]);
      setNewBlockedEmail("");
    }
  };

  const handleAddBlockedUsername = () => {
    if (newBlockedUsername && !blockedUsernames.includes(newBlockedUsername)) {
      setBlockedUsernames([...blockedUsernames, newBlockedUsername]);
      setNewBlockedUsername("");
    }
  };

  const handleRemoveBlockedEmail = (email: string) => {
    setBlockedEmails(blockedEmails.filter(e => e !== email));
  };

  const handleRemoveBlockedUsername = (username: string) => {
    setBlockedUsernames(blockedUsernames.filter(u => u !== username));
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
              data-testid="button-back-system-settings"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-4xl font-bold text-primary" data-testid="text-settings-title">
              System Settings
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-settings-subtitle">
              Configure platform behavior and security
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auth" data-testid="tab-authentication">
              <Lock className="h-4 w-4 mr-2" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">
              <Settings className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Zap className="h-4 w-4 mr-2" />
              AI & Auto
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Signup Settings</CardTitle>
                <CardDescription>Control user registration preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Signups */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="signups" className="font-semibold">
                      Allow New Signups
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {signupsEnabled ? "New users can create accounts" : "Registration disabled"}
                    </p>
                  </div>
                  <Switch
                    id="signups"
                    checked={signupsEnabled}
                    onCheckedChange={setSignupsEnabled}
                    data-testid="toggle-allow-signups"
                  />
                </div>

                {/* Email Verification */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="verification" className="font-semibold">
                      Require Email Verification
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Users must verify email before accessing
                    </p>
                  </div>
                  <Switch
                    id="verification"
                    checked={emailVerificationRequired}
                    onCheckedChange={setEmailVerificationRequired}
                    data-testid="toggle-email-verification"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Blocked Emails */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Blocked Email Addresses</CardTitle>
                <CardDescription>Prevent signup with specific emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email to block"
                    value={newBlockedEmail}
                    onChange={(e) => setNewBlockedEmail(e.target.value)}
                    data-testid="input-blocked-email"
                  />
                  <Button onClick={handleAddBlockedEmail} data-testid="button-add-blocked-email">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {blockedEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      data-testid={`item-blocked-email-${email}`}
                    >
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBlockedEmail(email)}
                        data-testid={`button-remove-email-${email}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blocked Usernames */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Blocked Usernames</CardTitle>
                <CardDescription>Prevent signup with reserved usernames</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter username to block"
                    value={newBlockedUsername}
                    onChange={(e) => setNewBlockedUsername(e.target.value)}
                    data-testid="input-blocked-username"
                  />
                  <Button onClick={handleAddBlockedUsername} data-testid="button-add-blocked-username">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {blockedUsernames.map((username) => (
                    <div
                      key={username}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      data-testid={`item-blocked-username-${username}`}
                    >
                      <span className="text-sm font-mono">{username}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBlockedUsername(username)}
                        data-testid={`button-remove-username-${username}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings Tab */}
          <TabsContent value="content" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Media Limits</CardTitle>
                <CardDescription>Configure content upload restrictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Max Video Length */}
                <div>
                  <Label htmlFor="video-length" className="font-semibold">
                    Max Video Length: {maxVideoLength} seconds ({(maxVideoLength / 60).toFixed(1)} min)
                  </Label>
                  <input
                    id="video-length"
                    type="range"
                    min="30"
                    max="600"
                    value={maxVideoLength}
                    onChange={(e) => setMaxVideoLength(Number(e.target.value))}
                    className="w-full mt-2"
                    data-testid="slider-video-length"
                  />
                </div>

                {/* Max Image Size */}
                <div>
                  <Label htmlFor="image-size" className="font-semibold">
                    Max Image Size: {maxImageSize} MB
                  </Label>
                  <input
                    id="image-size"
                    type="range"
                    min="5"
                    max="100"
                    value={maxImageSize}
                    onChange={(e) => setMaxImageSize(Number(e.target.value))}
                    className="w-full mt-2"
                    data-testid="slider-image-size"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Allowed Formats */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Allowed File Formats</CardTitle>
                <CardDescription>Video formats accepted for upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allowedFormats.map((format) => (
                    <Badge
                      key={format}
                      variant="secondary"
                      className="px-3 py-1"
                      data-testid={`badge-format-${format}`}
                    >
                      {format.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Platform API credentials (read-only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-md font-mono text-xs break-all" data-testid="text-api-key-public">
                  Public Key: sk_live_47kj8w9kdj8w9k...
                </div>
                <div className="p-3 bg-muted/50 rounded-md font-mono text-xs break-all" data-testid="text-api-key-private">
                  Private Key: sk_secret_8sj8s9js8sj... (hidden)
                </div>
              </CardContent>
            </Card>

            {/* Admin Logs */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Admin Activity Logs</CardTitle>
                <CardDescription>Recent admin actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded" data-testid="log-admin-1">
                    <span className="font-mono text-xs text-muted-foreground">2024-11-27 14:32</span>
                    <p>Admin user suspended account: fake_verified</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded" data-testid="log-admin-2">
                    <span className="font-mono text-xs text-muted-foreground">2024-11-27 14:15</span>
                    <p>Created new badge: Creator Elite</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded" data-testid="log-admin-3">
                    <span className="font-mono text-xs text-muted-foreground">2024-11-27 13:45</span>
                    <p>Modified content policy: Max video length set to 300s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login Logs */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Login Attempts</CardTitle>
                <CardDescription>Recent admin login activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded flex items-center justify-between" data-testid="login-log-1">
                    <div>
                      <p className="font-semibold">admin@afrosphere.com</p>
                      <span className="text-xs text-muted-foreground">2024-11-27 15:22 • 192.168.1.1</span>
                    </div>
                    <Badge variant="default">Success</Badge>
                  </div>
                  <div className="p-2 bg-muted/50 rounded flex items-center justify-between" data-testid="login-log-2">
                    <div>
                      <p className="font-semibold">admin@afrosphere.com</p>
                      <span className="text-xs text-muted-foreground">2024-11-27 10:15 • 192.168.1.2</span>
                    </div>
                    <Badge variant="default">Success</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Monitoring */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Device Monitoring</CardTitle>
                <CardDescription>Active admin sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-primary/10 rounded-md border border-primary/20" data-testid="device-current">
                    <p className="font-semibold">Current Device (Active)</p>
                    <p className="text-xs text-muted-foreground mt-1">Chrome • Mac OS • Last active: now</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md" data-testid="device-other">
                    <p className="font-semibold">Safari • iPad OS</p>
                    <p className="text-xs text-muted-foreground mt-1">Last active: 2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & Automation Tab */}
          <TabsContent value="ai" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>ORÍ AI Settings</CardTitle>
                <CardDescription>Configure platform AI features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ori-ai" className="font-semibold">
                      Enable ORÍ AI
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI-powered content recommendations and insights
                    </p>
                  </div>
                  <Switch
                    id="ori-ai"
                    checked={oriAIEnabled}
                    onCheckedChange={setOriAIEnabled}
                    data-testid="toggle-ori-ai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="content-review" className="font-semibold">
                      Content Review AI
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automated content quality analysis
                    </p>
                  </div>
                  <Switch
                    id="content-review"
                    checked={contentReviewAI}
                    onCheckedChange={setContentReviewAI}
                    data-testid="toggle-content-review"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Auto-Moderation</CardTitle>
                <CardDescription>Automatic content moderation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-mod" className="font-semibold">
                      Enable Auto-Moderation
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {autoModerationEnabled
                        ? "Automatically flagging policy violations"
                        : "Manual moderation only"}
                    </p>
                  </div>
                  <Switch
                    id="auto-mod"
                    checked={autoModerationEnabled}
                    onCheckedChange={setAutoModerationEnabled}
                    data-testid="toggle-auto-moderation"
                  />
                </div>

                {/* Filtering Sensitivity */}
                <div>
                  <Label htmlFor="sensitivity" className="font-semibold">
                    Filtering Sensitivity
                  </Label>
                  <Select value={filteringSensitivity} onValueChange={setFilteringSensitivity}>
                    <SelectTrigger id="sensitivity" data-testid="select-sensitivity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Less filtering)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="high">High (Strict filtering)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteringSensitivity === "low" &&
                      "Only catches clear policy violations"}
                    {filteringSensitivity === "medium" &&
                      "Balanced approach to content filtering"}
                    {filteringSensitivity === "high" &&
                      "Aggressive filtering of potential violations"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <Button className="w-full" data-testid="button-save-settings">
              Save All Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
