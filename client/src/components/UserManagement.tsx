import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, MoreVertical, Eye, Trash2, Lock, Shield, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  joinDate: string;
  verified: boolean;
  status: "active" | "suspended";
  posts: number;
  followers: number;
  following: number;
  phone?: string;
  deviceInfo?: string;
  lastActivity: string;
  badges: string[];
  reports: number;
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "adikeafrica",
    email: "adike@example.com",
    joinDate: "2023-01-15",
    verified: true,
    status: "active",
    posts: 156,
    followers: 12847,
    following: 485,
    phone: "+234 802 123 4567",
    deviceInfo: "iOS Safari - iPhone 14",
    lastActivity: "2 minutes ago",
    badges: ["verified", "top-creator", "fashion-icon"],
    reports: 0,
  },
  {
    id: "2",
    username: "zara_style",
    email: "zara@example.com",
    joinDate: "2023-02-20",
    verified: true,
    status: "active",
    posts: 89,
    followers: 5420,
    following: 342,
    phone: "+234 703 456 7890",
    deviceInfo: "Android Chrome - Samsung S23",
    lastActivity: "45 minutes ago",
    badges: ["verified", "fashion-icon"],
    reports: 1,
  },
  {
    id: "3",
    username: "kente_vibes",
    email: "kente@example.com",
    joinDate: "2023-03-10",
    verified: true,
    status: "active",
    posts: 124,
    followers: 8934,
    following: 267,
    phone: "+233 20 123 4567",
    deviceInfo: "Web - Chrome Desktop",
    lastActivity: "3 hours ago",
    badges: ["verified", "fashion-icon"],
    reports: 0,
  },
  {
    id: "4",
    username: "amaarabeats",
    email: "amaara@example.com",
    joinDate: "2023-04-05",
    verified: true,
    status: "active",
    posts: 203,
    followers: 15600,
    following: 612,
    phone: "+234 812 789 0123",
    deviceInfo: "iOS Safari - iPhone 15 Pro",
    lastActivity: "5 minutes ago",
    badges: ["verified", "music-producer", "top-creator"],
    reports: 0,
  },
  {
    id: "5",
    username: "kojoart",
    email: "kojo@example.com",
    joinDate: "2023-05-12",
    verified: true,
    status: "suspended",
    posts: 76,
    followers: 3400,
    following: 189,
    phone: "+233 24 456 7890",
    deviceInfo: "Android Firefox - Google Pixel 7",
    lastActivity: "2 days ago",
    badges: ["verified", "artist"],
    reports: 4,
  },
  {
    id: "6",
    username: "wellness_guru",
    email: "wellness@example.com",
    joinDate: "2023-06-08",
    verified: false,
    status: "active",
    posts: 45,
    followers: 2100,
    following: 234,
    phone: "+27 21 456 7890",
    deviceInfo: "iOS Safari - iPad Air",
    lastActivity: "8 hours ago",
    badges: [],
    reports: 0,
  },
  {
    id: "7",
    username: "street_artist",
    email: "street@example.com",
    joinDate: "2023-07-22",
    verified: true,
    status: "active",
    posts: 167,
    followers: 9876,
    following: 445,
    phone: "+234 903 234 5678",
    deviceInfo: "Web - Safari Desktop",
    lastActivity: "1 hour ago",
    badges: ["verified", "artist", "community-hero"],
    reports: 2,
  },
  {
    id: "8",
    username: "culture_keeper",
    email: "culture@example.com",
    joinDate: "2023-08-30",
    verified: true,
    status: "active",
    posts: 198,
    followers: 7654,
    following: 521,
    phone: "+256 701 234 5678",
    deviceInfo: "Android Chrome - OnePlus 11",
    lastActivity: "20 minutes ago",
    badges: ["verified", "cultural-icon"],
    reports: 0,
  },
];

interface UserManagementProps {
  onBack?: () => void;
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuspend = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser(
        selectedUser.status === "active"
          ? { ...selectedUser, status: "suspended" }
          : { ...selectedUser, status: "active" }
      );
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
      setSelectedUser(null);
    }
  };

  const handleResetPassword = (username: string) => {
    alert(`Password reset email sent to ${username}`);
  };

  const handleAssignBadge = (userId: string, badgeName: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId && !u.badges.includes(badgeName)
          ? { ...u, badges: [...u.badges, badgeName] }
          : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        badges: [...(selectedUser.badges || []), badgeName],
      });
    }
  };

  const handleRemoveBadge = (userId: string, badgeName: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, badges: u.badges.filter((b) => b !== badgeName) }
          : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        badges: selectedUser.badges.filter((b) => b !== badgeName),
      });
    }
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedUser(null)}
              data-testid="button-back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary" data-testid="text-user-details-title">
                User Details
              </h1>
              <p className="text-muted-foreground">@{selectedUser.username}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Section */}
            <Card className="border-border/50 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-bold" data-testid="text-user-username">
                      {selectedUser.username}
                    </p>
                    <Badge
                      variant={selectedUser.status === "active" ? "default" : "destructive"}
                      data-testid={`badge-status-${selectedUser.status}`}
                    >
                      {selectedUser.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p data-testid="text-user-email">
                    <span className="text-muted-foreground">Email:</span> {selectedUser.email}
                  </p>
                  <p data-testid="text-user-phone">
                    <span className="text-muted-foreground">Phone:</span> {selectedUser.phone || "N/A"}
                  </p>
                  <p data-testid="text-user-join-date">
                    <span className="text-muted-foreground">Join Date:</span> {selectedUser.joinDate}
                  </p>
                  <p data-testid="text-user-last-activity">
                    <span className="text-muted-foreground">Last Activity:</span> {selectedUser.lastActivity}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Section */}
            <Card className="border-border/50 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary" data-testid="text-user-posts">
                    {selectedUser.posts}
                  </p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-500" data-testid="text-user-followers">
                      {selectedUser.followers.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500" data-testid="text-user-following">
                      {selectedUser.following}
                    </p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="border-border/50 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">System Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Device</p>
                  <p data-testid="text-user-device">{selectedUser.deviceInfo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verified</p>
                  <Badge variant={selectedUser.verified ? "default" : "secondary"} className="mt-1">
                    {selectedUser.verified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Reports</p>
                  <p
                    data-testid="text-user-reports"
                    className={selectedUser.reports > 0 ? "text-red-500 font-bold" : ""}
                  >
                    {selectedUser.reports}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Manage user badges and recognition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedUser.badges.length > 0 ? (
                  selectedUser.badges.map((badge) => (
                    <Badge
                      key={badge}
                      className="gap-2 pl-3"
                      data-testid={`badge-user-${badge}`}
                    >
                      {badge}
                      <button
                        onClick={() => handleRemoveBadge(selectedUser.id, badge)}
                        className="ml-1 hover:opacity-70"
                        data-testid={`button-remove-badge-${badge}`}
                      >
                        ✕
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No badges assigned</p>
                )}
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm font-medium mb-2">Assign Badge</p>
                <div className="flex flex-wrap gap-2">
                  {["verified", "top-creator", "fashion-icon", "music-producer", "artist", "community-hero", "cultural-icon"].map(
                    (badge) => (
                      !selectedUser.badges.includes(badge) && (
                        <Button
                          key={badge}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignBadge(selectedUser.id, badge)}
                          data-testid={`button-assign-badge-${badge}`}
                        >
                          + {badge}
                        </Button>
                      )
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="border-border/50 border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-500">Admin Actions</CardTitle>
              <CardDescription>Manage this user account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant={selectedUser.status === "active" ? "destructive" : "outline"}
                  onClick={() => handleSuspend(selectedUser.id)}
                  className="gap-2"
                  data-testid={`button-suspend-user-${selectedUser.id}`}
                >
                  <Ban className="h-4 w-4" />
                  {selectedUser.status === "active" ? "Suspend User" : "Unsuspend User"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetPassword(selectedUser.username)}
                  className="gap-2"
                  data-testid={`button-reset-password-${selectedUser.id}`}
                >
                  <Lock className="h-4 w-4" />
                  Reset Password
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedUser.id)}
                  className="gap-2 md:col-span-2"
                  data-testid={`button-delete-user-${selectedUser.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
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
                data-testid="button-back-dashboard"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-user-management-title">
              User Management
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-user-management-subtitle">
              Manage platform users and their accounts
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md border border-border/50 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="input-search-users"
          />
        </div>

        {/* Users Table */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Click on a user to view details and manage their account</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Profile</th>
                    <th className="px-4 py-3 text-left font-medium">Username</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Join Date</th>
                    <th className="px-4 py-3 text-left font-medium">Verified</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                      data-testid={`row-user-${user.id}`}
                    >
                      <td className="px-4 py-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="px-4 py-3 font-medium" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" data-testid={`text-joindate-${user.id}`}>
                        {user.joinDate}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.verified ? "default" : "secondary"}
                          data-testid={`badge-verified-${user.id}`}
                        >
                          {user.verified ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.status === "active" ? "default" : "destructive"}
                          data-testid={`badge-userstatus-${user.id}`}
                        >
                          {user.status === "active" ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="gap-1"
                            data-testid={`button-view-user-${user.id}`}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-menu-user-${user.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleSuspend(user.id)}
                                data-testid={`menu-suspend-${user.id}`}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                {user.status === "active" ? "Suspend" : "Unsuspend"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(user.id)}
                                className="text-red-500"
                                data-testid={`menu-delete-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
