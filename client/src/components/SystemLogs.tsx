import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  status: "success" | "failed" | "warning";
  details: string;
}

const ADMIN_ACTIVITY_LOGS: LogEntry[] = [
  {
    id: "aa1",
    timestamp: "2024-11-27 15:45:32",
    admin: "amara@afrosphere.com",
    action: "Suspended User",
    target: "fake_verified",
    status: "success",
    details: "Account suspended for impersonation",
  },
  {
    id: "aa2",
    timestamp: "2024-11-27 14:22:18",
    admin: "kofi@afrosphere.com",
    action: "Created Badge",
    target: "Creator Elite",
    status: "success",
    details: "New badge created with 5 slot limit",
  },
  {
    id: "aa3",
    timestamp: "2024-11-27 13:15:45",
    admin: "adeyinka@afrosphere.com",
    action: "Modified Settings",
    target: "Content Policy",
    status: "success",
    details: "Max video length changed to 300 seconds",
  },
];

const LOGIN_ATTEMPT_LOGS: LogEntry[] = [
  {
    id: "la1",
    timestamp: "2024-11-27 16:10:22",
    admin: "adeyinka@afrosphere.com",
    action: "Admin Login",
    target: "192.168.1.100",
    status: "success",
    details: "Chrome • macOS • Successful authentication",
  },
  {
    id: "la2",
    timestamp: "2024-11-27 15:05:10",
    admin: "amara@afrosphere.com",
    action: "Admin Login",
    target: "192.168.1.105",
    status: "success",
    details: "Firefox • Windows • Successful authentication",
  },
  {
    id: "la3",
    timestamp: "2024-11-27 12:30:45",
    admin: "unknown_user",
    action: "Failed Login",
    target: "192.168.2.50",
    status: "failed",
    details: "Invalid credentials - 3 attempts detected",
  },
];

const SUSPENSION_LOGS: LogEntry[] = [
  {
    id: "sl1",
    timestamp: "2024-11-27 15:45:32",
    admin: "amara@afrosphere.com",
    action: "User Suspended",
    target: "fake_verified",
    status: "success",
    details: "7-day suspension for impersonation",
  },
  {
    id: "sl2",
    timestamp: "2024-11-27 13:20:15",
    admin: "kofi@afrosphere.com",
    action: "User Suspended",
    target: "spam_bot_2024",
    status: "success",
    details: "Permanent suspension for bot activity",
  },
  {
    id: "sl3",
    timestamp: "2024-11-26 10:15:00",
    admin: "adeyinka@afrosphere.com",
    action: "Suspension Lifted",
    target: "user_blocked_12",
    status: "success",
    details: "Appeal approved - suspension removed",
  },
];

const POST_DELETION_LOGS: LogEntry[] = [
  {
    id: "pd1",
    timestamp: "2024-11-27 14:33:22",
    admin: "kofi@afrosphere.com",
    action: "Post Deleted",
    target: "post_#5892",
    status: "success",
    details: "Deleted for adult content violation",
  },
  {
    id: "pd2",
    timestamp: "2024-11-27 12:45:10",
    admin: "amara@afrosphere.com",
    action: "Post Deleted",
    target: "post_#5821",
    status: "success",
    details: "Deleted for copyright violation",
  },
  {
    id: "pd3",
    timestamp: "2024-11-26 16:20:33",
    admin: "moderation_team",
    action: "Post Hidden",
    target: "post_#5745",
    status: "warning",
    details: "Post hidden pending review - misinformation",
  },
];

const BADGE_ASSIGNMENT_LOGS: LogEntry[] = [
  {
    id: "ba1",
    timestamp: "2024-11-27 14:22:18",
    admin: "kofi@afrosphere.com",
    action: "Badge Assigned",
    target: "adikeafrica",
    status: "success",
    details: "Verified Creator badge assigned",
  },
  {
    id: "ba2",
    timestamp: "2024-11-26 11:15:45",
    admin: "amara@afrosphere.com",
    action: "Badge Assigned",
    target: "amaarabeats",
    status: "success",
    details: "Creator Elite badge assigned",
  },
  {
    id: "ba3",
    timestamp: "2024-11-25 09:30:22",
    admin: "adeyinka@afrosphere.com",
    action: "Badge Revoked",
    target: "user_banned_45",
    status: "warning",
    details: "Verified badge revoked - policy violation",
  },
];

const API_ERROR_LOGS: LogEntry[] = [
  {
    id: "ae1",
    timestamp: "2024-11-27 15:12:33",
    admin: "system",
    action: "API Error",
    target: "/api/users/list",
    status: "failed",
    details: "Database connection timeout - recovered after 3 retries",
  },
  {
    id: "ae2",
    timestamp: "2024-11-27 12:08:15",
    admin: "system",
    action: "API Error",
    target: "/api/posts/upload",
    status: "warning",
    details: "Rate limit exceeded - throttled requests",
  },
  {
    id: "ae3",
    timestamp: "2024-11-26 08:45:22",
    admin: "system",
    action: "Service Recovered",
    target: "Image Processing Service",
    status: "success",
    details: "Service back online after maintenance window",
  },
];

const NOTIFICATION_LOGS: LogEntry[] = [
  {
    id: "nl1",
    timestamp: "2024-11-27 16:00:00",
    admin: "amara@afrosphere.com",
    action: "Notification Sent",
    target: "All Users",
    status: "success",
    details: "Broadcast: 'New Features Available' - 12,847 recipients",
  },
  {
    id: "nl2",
    timestamp: "2024-11-26 14:30:45",
    admin: "kofi@afrosphere.com",
    action: "Notification Sent",
    target: "Verified Creators",
    status: "success",
    details: "Segment: 'Creator Summit 2025' - 1,205 recipients",
  },
  {
    id: "nl3",
    timestamp: "2024-11-25 10:15:22",
    admin: "adeyinka@afrosphere.com",
    action: "Notification Failed",
    target: "Premium Users",
    status: "failed",
    details: "Failed to send to 15 users - invalid tokens",
  },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "success":
      return "default";
    case "failed":
      return "destructive";
    case "warning":
      return "secondary";
    default:
      return "default";
  }
};

interface SystemLogsProps {
  onBack?: () => void;
}

export default function SystemLogs({ onBack }: SystemLogsProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const LogTable = ({ logs }: { logs: LogEntry[] }) => {
    const filtered = filterStatus === "all" 
      ? logs 
      : logs.filter(log => log.status === filterStatus);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium">Admin/System</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Target</th>
              <th className="px-4 py-3 text-left font-medium">Details</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr
                key={log.id}
                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                data-testid={`row-log-${log.id}`}
              >
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono" data-testid={`text-log-timestamp-${log.id}`}>
                  {log.timestamp}
                </td>
                <td className="px-4 py-3 text-sm" data-testid={`text-log-admin-${log.id}`}>
                  {log.admin}
                </td>
                <td className="px-4 py-3 font-medium" data-testid={`text-log-action-${log.id}`}>
                  {log.action}
                </td>
                <td className="px-4 py-3 text-sm" data-testid={`text-log-target-${log.id}`}>
                  {log.target}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground" data-testid={`text-log-details-${log.id}`}>
                  {log.details}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={getStatusBadgeVariant(log.status)}
                    data-testid={`badge-log-status-${log.id}`}
                  >
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
                data-testid="button-back-system-logs"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-system-logs-title">
              System Logs
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-system-logs-subtitle">
              Internal monitoring and audit trails
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-logs">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filter */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40" data-testid="select-log-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                  <SelectItem value="warning">Warnings Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="admin" data-testid="tab-admin-activity">
              Admin Activity
            </TabsTrigger>
            <TabsTrigger value="login" data-testid="tab-login-attempts">
              Login
            </TabsTrigger>
            <TabsTrigger value="suspension" data-testid="tab-suspensions">
              Suspensions
            </TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-post-deletions">
              Posts
            </TabsTrigger>
            <TabsTrigger value="badges" data-testid="tab-badge-assignments">
              Badges
            </TabsTrigger>
            <TabsTrigger value="api" data-testid="tab-api-errors">
              API
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notification-logs">
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Admin Activity Tab */}
          <TabsContent value="admin" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Admin Activity Logs</CardTitle>
                <CardDescription>Actions performed by admin team ({ADMIN_ACTIVITY_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={ADMIN_ACTIVITY_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login Attempts Tab */}
          <TabsContent value="login" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Login Attempts</CardTitle>
                <CardDescription>Admin authentication events ({LOGIN_ATTEMPT_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={LOGIN_ATTEMPT_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suspensions Tab */}
          <TabsContent value="suspension" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Suspensions</CardTitle>
                <CardDescription>User suspension and appeals ({SUSPENSION_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={SUSPENSION_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post Deletions Tab */}
          <TabsContent value="posts" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Post Deletions</CardTitle>
                <CardDescription>Posts deleted or hidden ({POST_DELETION_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={POST_DELETION_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badge Assignments Tab */}
          <TabsContent value="badges" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Badge Assignments</CardTitle>
                <CardDescription>Badge assignments and revocations ({BADGE_ASSIGNMENT_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={BADGE_ASSIGNMENT_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Errors Tab */}
          <TabsContent value="api" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>API Errors</CardTitle>
                <CardDescription>System errors and API issues ({API_ERROR_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={API_ERROR_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Notification Logs</CardTitle>
                <CardDescription>Broadcast notifications sent ({NOTIFICATION_LOGS.length})</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LogTable logs={NOTIFICATION_LOGS} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Log Retention</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>All system logs are retained for 90 days and automatically archived after that period. Export logs regularly for long-term retention and compliance.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
