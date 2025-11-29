import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Edit2, Trash2, Users, Wand2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  usersCount: number;
}

interface UserOption {
  id: string;
  username: string;
}

interface UserWithBadge {
  id: string;
  username: string;
}

const DEFAULT_BADGES: BadgeItem[] = [
  {
    id: "creator",
    name: "Creator Badge",
    description: "Awarded to talented content creators on the platform",
    icon: "✨",
    color: "text-yellow-500",
    usersCount: 245,
  },
  {
    id: "verified",
    name: "Verified Badge",
    description: "Verified account status for authentic creators",
    icon: "✓",
    color: "text-blue-500",
    usersCount: 892,
  },
  {
    id: "cultural-leader",
    name: "Cultural Leader Badge",
    description: "Leaders promoting African culture and heritage",
    icon: "👑",
    color: "text-purple-500",
    usersCount: 67,
  },
  {
    id: "traditional-ruler",
    name: "Traditional Ruler Badge",
    description: "Honorary badge for traditional leaders and royalty",
    icon: "👨‍🎓",
    color: "text-red-500",
    usersCount: 23,
  },
  {
    id: "celebrity",
    name: "Celebrity Badge",
    description: "Recognized public figures and celebrities",
    icon: "⭐",
    color: "text-orange-500",
    usersCount: 156,
  },
  {
    id: "staff",
    name: "Staff Badge",
    description: "AfroSphere team members and staff",
    icon: "🛠️",
    color: "text-green-500",
    usersCount: 12,
  },
  {
    id: "founder",
    name: "Founder Badge",
    description: "Platform founders and co-founders",
    icon: "🚀",
    color: "text-pink-500",
    usersCount: 3,
  },
  {
    id: "ori-council",
    name: "ORÍ AI Council Badge",
    description: "Members of the ORÍ AI Council (future)",
    icon: "🤖",
    color: "text-cyan-500",
    usersCount: 0,
  },
];

interface BadgesManagementProps {
  onBack?: () => void;
}

export default function BadgesManagement({ onBack }: BadgesManagementProps) {
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeIcon, setNewBadgeIcon] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assigningBadgeId, setAssigningBadgeId] = useState<string | null>(null);
  const [assignUsername, setAssignUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingBadges, setIsSeedingBadges] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [badgeUsersMap, setBadgeUsersMap] = useState<Map<string, UserWithBadge[]>>(new Map());
  const [expandedBadgeId, setExpandedBadgeId] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/badges");
      if (response.ok) {
        const badgesData = await response.json();
        // Count users per badge
        const badgesWithCounts = await Promise.all((badgesData || []).map(async (badge: any) => {
          try {
            const badgeUsersRes = await fetch(`/api/admin/badges/${badge.id}/users`);
            if (badgeUsersRes.ok) {
              const badgeUsers = await badgeUsersRes.json();
              const usersList = Array.isArray(badgeUsers) ? badgeUsers : (badgeUsers?.users || []);
              const count = usersList.length;
              setBadgeUsersMap(prev => new Map(prev).set(badge.id, usersList));
              return { ...badge, usersCount: count };
            }
          } catch (e) {
            console.error("Error fetching badge users:", e);
          }
          return { ...badge, usersCount: 0 };
        }));
        setBadges(badgesWithCounts || DEFAULT_BADGES);
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/all");
      if (response.ok) {
        const data = await response.json();
        setUsersList(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateBadge = async () => {
    if (!newBadgeName || !newBadgeDesc || !newBadgeIcon) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBadgeName,
          type: "custom",
          description: newBadgeDesc,
          iconSvg: newBadgeIcon,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newBadge: BadgeItem = {
          id: data.id || newBadgeName.toLowerCase().replace(/\s+/g, "-"),
          name: newBadgeName,
          description: newBadgeDesc,
          icon: newBadgeIcon,
          color: "text-gray-500",
          usersCount: 0,
        };
        setBadges([...badges, newBadge]);
        setNewBadgeName("");
        setNewBadgeDesc("");
        setNewBadgeIcon("");
        setShowCreateDialog(false);
        toast({ title: "Success", description: "Badge created successfully" });
      } else {
        toast({ title: "Error", description: "Failed to create badge", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create badge", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge || !newBadgeName || !newBadgeDesc || !newBadgeIcon) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    
    try {
      setIsLoading(true);
      setBadges(
        badges.map((b) =>
          b.id === editingBadge.id
            ? { ...b, name: newBadgeName, description: newBadgeDesc, icon: newBadgeIcon }
            : b
        )
      );
      setEditingBadge(null);
      setNewBadgeName("");
      setNewBadgeDesc("");
      setNewBadgeIcon("");
      setShowEditDialog(false);
      toast({ title: "Success", description: "Badge updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update badge", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/badges/${badgeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        setBadges(badges.filter((b) => b.id !== badgeId));
        toast({ title: "Success", description: "Badge deleted successfully" });
      } else {
        toast({ title: "Error", description: "Failed to delete badge", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete badge", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignBadge = async () => {
    if (!assigningBadgeId || !selectedUserId) {
      toast({ title: "Error", description: "Badge and user required", variant: "destructive" });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/badges/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          badgeId: assigningBadgeId,
        }),
      });
      
      if (response.ok) {
        setAssignSuccess(true);
        await fetchBadges();
        setTimeout(() => {
          setShowAssignDialog(false);
          setAssignSuccess(false);
          setAssigningBadgeId(null);
          setSelectedUserId("");
        }, 2000);
      } else {
        toast({ title: "Error", description: "Failed to assign badge", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign badge", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignBadge = async (userId: string, badgeId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/badges/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, badgeId }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Badge removed successfully" });
        await fetchBadges();
      } else {
        toast({ title: "Error", description: "Failed to remove badge", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove badge", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedBadges = async () => {
    try {
      setIsSeedingBadges(true);
      const response = await fetch("/api/admin/badges/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "10 default badges seeded successfully" });
        await fetchBadges();
      } else {
        toast({ title: "Error", description: "Failed to seed badges", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to seed badges", variant: "destructive" });
    } finally {
      setIsSeedingBadges(false);
    }
  };

  const startEdit = (badge: BadgeItem) => {
    setEditingBadge(badge);
    setNewBadgeName(badge.name);
    setNewBadgeDesc(badge.description);
    setNewBadgeIcon(badge.icon);
    setShowEditDialog(true);
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
                data-testid="button-back-dashboard-badges"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-badges-management-title">
              Badges Management
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-badges-management-subtitle">
              Create and manage user badges
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSeedBadges}
              variant="outline"
              className="gap-2"
              disabled={isSeedingBadges}
              data-testid="button-seed-badges"
            >
              <Wand2 className="h-4 w-4" />
              {isSeedingBadges ? "Seeding..." : "Seed Default Badges"}
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-create-badge">
                  <Plus className="h-4 w-4" />
                  Create Badge
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-badge">
                <DialogHeader>
                  <DialogTitle>Create New Badge</DialogTitle>
                  <DialogDescription>Add a new badge to the platform</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium" data-testid="label-badge-name">
                      Badge Name
                    </label>
                    <input
                      type="text"
                      value={newBadgeName}
                      onChange={(e) => setNewBadgeName(e.target.value)}
                      placeholder="e.g., Top Creator"
                      className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                      data-testid="input-badge-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" data-testid="label-badge-icon">
                      Icon Emoji
                    </label>
                    <input
                      type="text"
                      value={newBadgeIcon}
                      onChange={(e) => setNewBadgeIcon(e.target.value)}
                      placeholder="e.g., ✨"
                      className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                      data-testid="input-badge-icon"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" data-testid="label-badge-description">
                      Description
                    </label>
                    <textarea
                      value={newBadgeDesc}
                      onChange={(e) => setNewBadgeDesc(e.target.value)}
                      placeholder="Describe the badge purpose..."
                      className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                      rows={3}
                      data-testid="textarea-badge-description"
                    />
                  </div>
                  <Button onClick={handleCreateBadge} className="w-full" data-testid="button-confirm-create">
                    Create Badge
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className="border-border/50 hover-elevate" data-testid={`card-badge-${badge.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: badge.icon }} />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(badge)}
                      data-testid={`button-edit-badge-${badge.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBadge(badge.id)}
                      data-testid={`button-delete-badge-${badge.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg" data-testid={`text-badge-name-${badge.id}`}>
                  {badge.name}
                </CardTitle>
                <CardDescription className="text-xs" data-testid={`text-badge-description-${badge.id}`}>
                  {badge.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <button
                    className="text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
                    onClick={() => setExpandedBadgeId(expandedBadgeId === badge.id ? null : badge.id)}
                    data-testid={`button-toggle-badge-users-${badge.id}`}
                  >
                    {badge.usersCount} users {expandedBadgeId === badge.id ? "▼" : "▶"}
                  </button>
                </div>
                {expandedBadgeId === badge.id && badgeUsersMap.get(badge.id) && (
                  <div className="mt-2 space-y-2 pl-4 border-l border-border/50">
                    {badgeUsersMap.get(badge.id)!.map((user) => (
                      <div key={user.id} className="flex items-center justify-between py-1">
                        <span className="text-sm text-foreground" data-testid={`text-badge-user-${badge.id}-${user.id}`}>
                          {user.username}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive/10"
                          onClick={() => handleUnassignBadge(user.id, badge.id)}
                          data-testid={`button-unassign-badge-${badge.id}-${user.id}`}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {badgeUsersMap.get(badge.id)!.length === 0 && (
                      <p className="text-xs text-muted-foreground">No users assigned</p>
                    )}
                  </div>
                )}
                <Dialog open={showAssignDialog && assigningBadgeId === badge.id} onOpenChange={(open) => {
                  if (!open) {
                    setShowAssignDialog(false);
                    setAssigningBadgeId(null);
                    setSelectedUserId("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setAssigningBadgeId(badge.id);
                        setShowAssignDialog(true);
                        fetchUsers();
                      }}
                      data-testid={`button-assign-badge-${badge.id}`}
                    >
                      Assign to User
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid={`dialog-assign-badge-${badge.id}`}>
                    <DialogHeader>
                      <DialogTitle>Assign Badge: {badge.name}</DialogTitle>
                      <DialogDescription>Select a user to assign this badge to</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium" data-testid="label-select-user">
                          Select User
                        </label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger data-testid="trigger-select-user">
                            <SelectValue placeholder="Choose a user..." />
                          </SelectTrigger>
                          <SelectContent>
                            {usersList.map((user) => (
                              <SelectItem key={user.id} value={user.id} data-testid={`option-user-${user.id}`}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-md flex items-center gap-2">
                        <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: badge.icon }} />
                        <div>
                          <p className="text-xs text-muted-foreground">Badge</p>
                          <p className="text-sm font-medium text-foreground">{badge.name}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {assignSuccess && (
                          <div className="p-2 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-sm text-center font-medium" data-testid="success-assign-badge">
                            Badge assigned successfully!
                          </div>
                        )}
                        <Button
                          onClick={handleAssignBadge}
                          className="w-full"
                          disabled={isLoading || assignSuccess}
                          data-testid={`button-confirm-assign-${badge.id}`}
                        >
                          {assignSuccess ? "Assigned!" : isLoading ? "Assigning..." : "Assign Badge"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Badge Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent data-testid="dialog-edit-badge">
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
              <DialogDescription>Update badge information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" data-testid="label-edit-badge-name">
                  Badge Name
                </label>
                <input
                  type="text"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                  data-testid="input-edit-badge-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium" data-testid="label-edit-badge-icon">
                  Icon Emoji
                </label>
                <input
                  type="text"
                  value={newBadgeIcon}
                  onChange={(e) => setNewBadgeIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                  data-testid="input-edit-badge-icon"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium" data-testid="label-edit-badge-description">
                  Description
                </label>
                <textarea
                  value={newBadgeDesc}
                  onChange={(e) => setNewBadgeDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                  rows={3}
                  data-testid="textarea-edit-badge-description"
                />
              </div>
              <Button onClick={handleUpdateBadge} className="w-full" data-testid="button-confirm-edit">
                Update Badge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
