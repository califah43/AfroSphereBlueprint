import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, AlertCircle, UserPlus, RotateCw, UserCog, FileCog, Badge, Bell, FileJson, Settings, Users2, LogOut } from "lucide-react";
import UserManagement from "./UserManagement";
import PostManagement from "./PostManagement";
import BadgesManagement from "./BadgesManagement";
import NotificationsCenter from "./NotificationsCenter";
import ReportsCenter from "./ReportsCenter";
import SystemSettings from "./SystemSettings";
import SystemLogs from "./SystemLogs";
import TeamManagement from "./TeamManagement";
import EmergencyControlPanel from "./EmergencyControlPanel";
import UserSettingsManagement from "./UserSettingsManagement";

interface AdminDashboardProps {
  onNavigate?: (section: string) => void;
  onLogout?: () => void;
}

export default function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState<string>("dashboard");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOwner] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    dailyActiveUsers: 0,
    reportsToday: 0,
    newSignupsToday: 0,
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const metrics = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "Total Posts", value: stats.totalPosts.toLocaleString(), icon: FileText, color: "text-orange-500" },
    { label: "Daily Active Users", value: stats.dailyActiveUsers.toLocaleString(), icon: TrendingUp, color: "text-green-500" },
    { label: "Reports Today", value: stats.reportsToday.toLocaleString(), icon: AlertCircle, color: "text-red-500" },
    { label: "New Sign-Ups Today", value: stats.newSignupsToday.toLocaleString(), icon: UserPlus, color: "text-purple-500" },
  ];

  const actions = [
    { label: "Refresh Stats", icon: RotateCw, onClick: handleRefresh, variant: "outline" as const },
    { label: "User Management", icon: UserCog, onClick: () => setCurrentSection("users"), variant: "default" as const },
    { label: "Post Management", icon: FileCog, onClick: () => setCurrentSection("posts"), variant: "default" as const },
    { label: "User Settings Manager", icon: Settings, onClick: () => setCurrentSection("user-settings"), variant: "default" as const },
    { label: "Badges Manager", icon: Badge, onClick: () => setCurrentSection("badges"), variant: "default" as const },
    { label: "Notifications Center", icon: Bell, onClick: () => setCurrentSection("notifications"), variant: "default" as const },
    { label: "System Logs", icon: FileJson, onClick: () => setCurrentSection("logs"), variant: "default" as const },
    { label: "System Settings", icon: Settings, onClick: () => setCurrentSection("settings"), variant: "default" as const },
    { label: "Team Management", icon: Users2, onClick: () => setCurrentSection("team"), variant: "default" as const },
  ];

  if (currentSection === "users") {
    return <UserManagement onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "posts") {
    return <PostManagement onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "badges") {
    return <BadgesManagement onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "notifications") {
    return <NotificationsCenter onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "logs") {
    return <SystemLogs onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "settings") {
    return <SystemSettings onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "team") {
    return <TeamManagement onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "reports") {
    return <ReportsCenter onBack={() => setCurrentSection("dashboard")} />;
  }

  if (currentSection === "emergency") {
    return <EmergencyControlPanel onBack={() => setCurrentSection("dashboard")} isOwner={isOwner} />;
  }

  if (currentSection === "user-settings") {
    return <UserSettingsManagement onBack={() => setCurrentSection("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-admin-role">
              Super Admin • System Administrator
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2"
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="border-border/50" data-testid={`card-metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground" data-testid={`text-metric-${metric.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {metric.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage platform content and users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant={action.variant}
                    onClick={action.onClick}
                    className="h-auto py-4 flex flex-col items-center gap-2 justify-center"
                    data-testid={`button-admin-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Welcome Section */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Welcome to AfroSphere Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              You have access to comprehensive admin tools to manage the platform, moderate content, and monitor system health. Use the quick actions above to navigate to specific management sections.
            </p>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSection("emergency")}
                className="text-destructive hover:text-destructive"
                data-testid="button-access-emergency-panel"
              >
                🔐 Emergency Control Panel
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
