import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Send, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "app" | "push";
  targetAudience: string;
  priority: "low" | "medium" | "high";
  status: "sent" | "scheduled" | "failed";
  sentAt: string;
  openRate?: number;
  recipientCount: number;
}

const MOCK_HISTORY: Notification[] = [
  {
    id: "1",
    title: "New Feature Alert",
    message: "Check out our new Direct Messaging feature!",
    type: "push",
    targetAudience: "All users",
    priority: "high",
    status: "sent",
    sentAt: "2024-11-27 10:30 AM",
    openRate: 68,
    recipientCount: 12847,
  },
  {
    id: "2",
    title: "Creator Milestone",
    message: "Congratulations! You reached 10K followers",
    type: "app",
    targetAudience: "Users with 10K+ followers",
    priority: "medium",
    status: "sent",
    sentAt: "2024-11-26 3:45 PM",
    openRate: 82,
    recipientCount: 456,
  },
  {
    id: "3",
    title: "Platform Maintenance",
    message: "Scheduled maintenance on Nov 30, 2-4 AM UTC",
    type: "push",
    targetAudience: "All users",
    priority: "high",
    status: "scheduled",
    sentAt: "2024-11-30 2:00 AM",
    openRate: 0,
    recipientCount: 12847,
  },
  {
    id: "4",
    title: "Welcome to AfroSphere",
    message: "Start exploring African creativity today!",
    type: "app",
    targetAudience: "Newly signed up",
    priority: "medium",
    status: "sent",
    sentAt: "2024-11-25 8:20 AM",
    openRate: 91,
    recipientCount: 157,
  },
  {
    id: "5",
    title: "System Error",
    message: "Failed to send notification batch",
    type: "push",
    targetAudience: "Specific user",
    priority: "low",
    status: "failed",
    sentAt: "2024-11-24 11:15 PM",
    openRate: 0,
    recipientCount: 1,
  },
];

interface NotificationsCenterProps {
  onBack?: () => void;
}

export default function NotificationsCenter({ onBack }: NotificationsCenterProps) {
  const [history, setHistory] = useState<Notification[]>(MOCK_HISTORY);
  const [showCreator, setShowCreator] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"app" | "push">("app");
  const [targetAudience, setTargetAudience] = useState("all");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [scheduleTime, setScheduleTime] = useState("");
  const [sendNow, setSendNow] = useState(true);

  const handleSendNotification = () => {
    if (title && message) {
      const newNotification: Notification = {
        id: String(history.length + 1),
        title,
        message,
        type,
        targetAudience: getTargetAudienceLabel(targetAudience),
        priority,
        status: sendNow ? "sent" : "scheduled",
        sentAt: sendNow ? new Date().toLocaleString() : scheduleTime,
        openRate: sendNow ? 0 : undefined,
        recipientCount: Math.floor(Math.random() * 13000),
      };
      setHistory([newNotification, ...history]);
      // Reset form
      setTitle("");
      setMessage("");
      setType("app");
      setTargetAudience("all");
      setPriority("medium");
      setScheduleTime("");
      setSendNow(true);
      setShowCreator(false);
    }
  };

  const getTargetAudienceLabel = (value: string): string => {
    const labels: Record<string, string> = {
      all: "All users",
      specific: "Specific user",
      badge: "Users with badge",
      country: "Users in country",
      newusers: "Newly signed up",
    };
    return labels[value] || value;
  };

  if (showCreator) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCreator(false)}
              data-testid="button-back-notifications"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary" data-testid="text-notification-creator-title">
                Create Notification
              </h1>
              <p className="text-muted-foreground">Send a notification to platform users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle>Notification Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium" data-testid="label-notification-title">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., New Feature Release"
                    className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                    data-testid="input-notification-title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" data-testid="label-notification-message">
                    Message Body
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your notification message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                    data-testid="textarea-notification-message"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" data-testid="label-notification-type">
                      Type
                    </label>
                    <Select value={type} onValueChange={(v) => setType(v as "app" | "push")}>
                      <SelectTrigger className="mt-1" data-testid="select-notification-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">App Notification</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium" data-testid="label-notification-priority">
                      Priority
                    </label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "medium" | "high")}>
                      <SelectTrigger className="mt-1" data-testid="select-notification-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" data-testid="label-notification-audience">
                    Target Audience
                  </label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger className="mt-1" data-testid="select-notification-audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users</SelectItem>
                      <SelectItem value="specific">Specific user</SelectItem>
                      <SelectItem value="badge">Users with badge</SelectItem>
                      <SelectItem value="country">Users in country</SelectItem>
                      <SelectItem value="newusers">Newly signed up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  <label className="text-sm font-medium" data-testid="label-notification-schedule">
                    Schedule
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={sendNow}
                        onChange={() => setSendNow(true)}
                        data-testid="radio-send-now"
                      />
                      <span className="text-sm">Send Now</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!sendNow}
                        onChange={() => setSendNow(false)}
                        data-testid="radio-send-later"
                      />
                      <span className="text-sm">Send Later</span>
                    </label>
                  </div>
                  {!sendNow && (
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm"
                      data-testid="input-schedule-time"
                    />
                  )}
                </div>

                <Button
                  onClick={handleSendNotification}
                  className="w-full gap-2 mt-6"
                  data-testid="button-send-notification"
                >
                  <Send className="h-4 w-4" />
                  {sendNow ? "Send Now" : "Schedule Notification"}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Lock Screen Preview</CardTitle>
                <CardDescription>How it will appear on devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-2xl p-4 border-8 border-gray-800 min-h-96 flex flex-col justify-end space-y-3">
                  <div className="text-xs text-gray-400">9:41</div>
                  <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 space-y-2">
                    <p className="text-white font-bold text-sm" data-testid="preview-title">
                      {title || "Notification Title"}
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed" data-testid="preview-message">
                      {message || "Your message will appear here"}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Badge variant="secondary" className="text-xs" data-testid="preview-type">
                        {type === "app" ? "In-App" : "Push"}
                      </Badge>
                      <Badge
                        variant={priority === "high" ? "destructive" : "secondary"}
                        className="text-xs"
                        data-testid="preview-priority"
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4 gap-2"
                data-testid="button-back-dashboard-notifications"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-notifications-center-title">
              Notifications Center
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-notifications-center-subtitle">
              Create and manage platform notifications
            </p>
          </div>
          <Button onClick={() => setShowCreator(true)} className="gap-2" data-testid="button-create-notification">
            <Send className="h-4 w-4" />
            Create Notification
          </Button>
        </div>

        {/* History */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>Previously sent notifications and scheduled broadcasts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Audience</th>
                    <th className="px-4 py-3 text-left font-medium">Recipients</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Sent</th>
                    <th className="px-4 py-3 text-left font-medium">Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((notif) => (
                    <tr
                      key={notif.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      data-testid={`row-notification-${notif.id}`}
                    >
                      <td className="px-4 py-3 font-medium" data-testid={`text-notif-title-${notif.id}`}>
                        {notif.title}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" data-testid={`badge-notif-type-${notif.id}`}>
                          {notif.type === "app" ? "In-App" : "Push"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs" data-testid={`text-notif-audience-${notif.id}`}>
                        {notif.targetAudience}
                      </td>
                      <td className="px-4 py-3" data-testid={`text-notif-recipients-${notif.id}`}>
                        {notif.recipientCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            notif.status === "sent"
                              ? "default"
                              : notif.status === "scheduled"
                              ? "secondary"
                              : "destructive"
                          }
                          data-testid={`badge-notif-status-${notif.id}`}
                        >
                          {notif.status === "scheduled" ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                            </div>
                          ) : (
                            notif.status.charAt(0).toUpperCase() + notif.status.slice(1)
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs" data-testid={`text-notif-sent-${notif.id}`}>
                        {notif.sentAt}
                      </td>
                      <td className="px-4 py-3" data-testid={`text-notif-openrate-${notif.id}`}>
                        {notif.status === "sent" ? `${notif.openRate}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
