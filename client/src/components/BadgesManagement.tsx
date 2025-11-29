import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Edit2, Trash2, Users, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  usersCount: number;
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
  const [badges, setBadges] = useState<BadgeItem[]>(DEFAULT_BADGES);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeIcon, setNewBadgeIcon] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [assigningBadgeId, setAssigningBadgeId] = useState<string | null>(null);
  const [assignUsername, setAssignUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingBadges, setIsSeedingBadges] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/badges");
      if (response.ok) {
        const data = await response.json();
        setBadges(data || DEFAULT_BADGES);
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    } finally {
      setIsLoading(false);
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
    if (!assigningBadgeId || !assignUsername) {
      toast({ title: "Error", description: "Badge and username required", variant: "destructive" });
      return;
    }
    
    try {
      setIsLoading(true);
      // First, find the user by username
      const userRes = await fetch(`/api/users/username/${assignUsername}`);
      if (!userRes.ok) {
        toast({ title: "Error", description: "User not found", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      const user = await userRes.json();
      const userId = user.id;
      
      // Now assign the badge
      const response = await fetch("/api/admin/badges/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          badgeId: assigningBadgeId,
        }),
      });
      
      if (response.ok) {
        const badgeName = badges.find(b => b.id === assigningBadgeId)?.name;
        toast({ title: "Success", description: `Badge "${badgeName}" assigned to @${assignUsername}` });
        setAssigningBadgeId(null);
        setAssignUsername("");
        await fetchBadges();
      } else {
        toast({ title: "Error", description: "Failed to assign badge", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign badge", variant: "destructive" });
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
                  <span data-testid={`text-badge-users-${badge.id}`}>{badge.usersCount} users</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setAssigningBadgeId(badge.id)}
                      data-testid={`button-assign-badge-${badge.id}`}
                    >
                      Assign to User
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid={`dialog-assign-badge-${badge.id}`}>
                    <DialogHeader>
                      <DialogTitle>Assign Badge: {badge.name}</DialogTitle>
                      <DialogDescription>Search and assign this badge to a user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium" data-testid="label-search-user">
                          Search User
                        </label>
                        <input
                          type="text"
                          value={assignUsername}
                          onChange={(e) => setAssignUsername(e.target.value)}
                          placeholder="Enter username..."
                          className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm mt-1"
                          data-testid="input-search-user"
                        />
                      </div>
                      <div className="p-3 bg-muted/50 rounded-md flex items-center gap-2">
                        <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: badge.icon }} />
                        <div>
                          <p className="text-xs text-muted-foreground">Badge</p>
                          <p className="text-sm font-medium text-foreground">{badge.name}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAssignBadge}
                        className="w-full"
                        data-testid={`button-confirm-assign-${badge.id}`}
                      >
                        Assign Badge
                      </Button>
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
