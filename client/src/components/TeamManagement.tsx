import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Trash2, Edit2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Moderator" | "Support";
  permissions: string[];
  status: "active" | "inactive";
}

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Adeyinka Okon",
    email: "adeyinka@afrosphere.com",
    role: "Owner",
    permissions: ["Full access"],
    status: "active",
  },
  {
    id: "2",
    name: "Amara Johnson",
    email: "amara@afrosphere.com",
    role: "Admin",
    permissions: ["Manage users", "Manage posts", "Manage badges", "Send notifications"],
    status: "active",
  },
  {
    id: "3",
    name: "Kofi Mensah",
    email: "kofi@afrosphere.com",
    role: "Moderator",
    permissions: ["Manage posts", "Manage badges"],
    status: "active",
  },
  {
    id: "4",
    name: "Zainab Ahmed",
    email: "zainab@afrosphere.com",
    role: "Support",
    permissions: ["View only"],
    status: "inactive",
  },
];

const PERMISSION_OPTIONS = [
  "View only",
  "Manage users",
  "Manage posts",
  "Manage badges",
  "Send notifications",
  "System settings",
  "Full access",
];

interface TeamManagementProps {
  onBack?: () => void;
}

export default function TeamManagement({ onBack }: TeamManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "Moderator" as const,
    permissions: [] as string[],
  });

  const handleAddMember = () => {
    if (newMember.email && newMember.role && newMember.permissions.length > 0) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.email.split("@")[0],
        email: newMember.email,
        role: newMember.role,
        permissions: newMember.permissions,
        status: "active",
      };
      setMembers([...members, member]);
      setNewMember({ email: "", role: "Moderator", permissions: [] });
      setIsAddDialogOpen(false);
    }
  };

  const handleTogglePermission = (permission: string) => {
    if (newMember.permissions.includes(permission)) {
      setNewMember({
        ...newMember,
        permissions: newMember.permissions.filter((p) => p !== permission),
      });
    } else {
      setNewMember({
        ...newMember,
        permissions: [...newMember.permissions, permission],
      });
    }
  };

  const handleRemoveMember = (id: string) => {
    if (confirm("Remove this team member?")) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m
      )
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "text-purple-600 bg-purple-50 dark:bg-purple-950";
      case "Admin":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
      case "Moderator":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950";
      case "Support":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4 gap-2"
                data-testid="button-back-team-management"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <h1 className="text-4xl font-bold text-primary" data-testid="text-team-title">
              Team Management
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-team-subtitle">
              Manage admin team members and permissions
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-team-member">
                <Plus className="h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-team-member">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new team member and assign permissions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="team@afrosphere.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    data-testid="input-member-email"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-semibold">
                    Role
                  </Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, role: value as any })
                    }
                  >
                    <SelectTrigger id="role" data-testid="select-member-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions */}
                <div className="space-y-3">
                  <Label className="font-semibold">Permissions</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {PERMISSION_OPTIONS.map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox
                          id={`perm-${permission}`}
                          checked={newMember.permissions.includes(permission)}
                          onCheckedChange={() => handleTogglePermission(permission)}
                          data-testid={`checkbox-permission-${permission.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        <Label
                          htmlFor={`perm-${permission}`}
                          className="font-normal cursor-pointer"
                        >
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-add-member"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={
                      !newMember.email || !newMember.role || newMember.permissions.length === 0
                    }
                    data-testid="button-save-new-member"
                  >
                    Add Member
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Members Table */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle>Team Members ({members.length})</CardTitle>
            <CardDescription>Active and inactive admin team members</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Permissions</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      data-testid={`row-team-member-${member.id}`}
                    >
                      <td className="px-4 py-3 font-medium" data-testid={`text-member-name-${member.id}`}>
                        {member.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground" data-testid={`text-member-email-${member.id}`}>
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${getRoleColor(member.role)}`}
                          variant="outline"
                          data-testid={`badge-member-role-${member.id}`}
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((perm) => (
                            <Badge
                              key={perm}
                              variant="secondary"
                              className="text-xs"
                              data-testid={`badge-permission-${member.id}-${perm.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={member.status === "active" ? "default" : "secondary"}
                          data-testid={`badge-member-status-${member.id}`}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(member.id)}
                            data-testid={`button-toggle-status-${member.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-500 hover:text-red-600"
                            data-testid={`button-remove-member-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Permission Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Full access:</span> All admin features
            </p>
            <p>
              <span className="font-semibold">View only:</span> Can view platform data but cannot make changes
            </p>
            <p>
              <span className="font-semibold">Custom permissions:</span> Choose specific features team members can access
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
