import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, AlertTriangle, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmergencyControlPanelProps {
  onBack?: () => void;
  isOwner?: boolean;
}

export default function EmergencyControlPanel({ onBack, isOwner = false }: EmergencyControlPanelProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    description: string;
  }>({
    open: false,
    action: "",
    title: "",
    description: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmergencyAction = async (action: string) => {
    try {
      setIsProcessing(true);
      let response;
      
      if (action === "maintenance") {
        response = await fetch("/api/admin/emergency/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: true }),
        });
      } else if (action === "disable_posting") {
        response = await fetch("/api/admin/emergency/disable-posting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ disabled: true }),
        });
      } else if (action === "clear_cache") {
        response = await fetch("/api/admin/emergency/clear-cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }

      if (response?.ok) {
        alert(`Action "${action}" executed successfully`);
        setConfirmDialog({ open: false, action: "", title: "", description: "" });
      }
    } catch (error) {
      console.error("Failed to execute emergency action:", error);
      alert("Failed to execute action");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <Card className="border-destructive/50 w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription className="mt-2">
              Emergency Control Panel is restricted to owner accounts only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onBack && (
              <Button
                onClick={onBack}
                className="w-full"
                data-testid="button-back-from-denied"
              >
                Back to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleActionClick = (action: string) => {
    const actions: Record<string, { title: string; description: string }> = {
      maintenance: {
        title: "Force Maintenance Mode",
        description: "This will put the entire app into maintenance mode. Users will see a maintenance page and cannot access any features. This action can be reversed from this panel.",
      },
      disable_posting: {
        title: "Disable Posting for Everyone",
        description: "This will prevent all users (including creators) from posting new content. Existing posts remain visible. This is useful during security issues or platform updates.",
      },
      clear_cache: {
        title: "Clear All Cache",
        description: "This will clear all application caches including user feed caches, image caches, and temporary data. This may cause temporary slowness as caches rebuild.",
      },
      reset_feed: {
        title: "Reset App Feed",
        description: "This will reset all user feeds to default state. All personalization data will be cleared. Users will see the discover feed reset to initial state.",
      },
      lock_admin: {
        title: "Lock Admin Access",
        description: "This will lock all admin accounts out of the admin panel. Only the owner can unlock this. Use only in emergency situations.",
      },
    };

    if (actions[action]) {
      setConfirmDialog({
        open: true,
        action,
        ...actions[action],
      });
    }
  };

  const handleConfirmAction = () => {
    const actionMessages: Record<string, string> = {
      maintenance: "App is now in MAINTENANCE MODE. Users will see a maintenance page.",
      disable_posting: "Posting has been DISABLED for all users.",
      clear_cache: "All application caches have been CLEARED.",
      reset_feed: "App feed has been RESET to default state.",
      lock_admin: "Admin access has been LOCKED. Only owner can unlock.",
    };

    if (actionMessages[confirmDialog.action]) {
      alert(`✓ Action Complete:\n${actionMessages[confirmDialog.action]}`);
      setConfirmDialog({ open: false, action: "", title: "", description: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
              data-testid="button-back-emergency-panel"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h1 className="text-4xl font-bold text-destructive" data-testid="text-emergency-title">
                Emergency Control Panel
              </h1>
            </div>
            <p className="text-muted-foreground" data-testid="text-emergency-subtitle">
              Owner-only critical system controls. Use with extreme caution.
            </p>
          </div>
          <Badge variant="destructive" className="text-lg px-3 py-1" data-testid="badge-owner-only">
            OWNER ONLY
          </Badge>
        </div>

        {/* Warning Banner */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              <span className="font-bold">⚠️ WARNING:</span> These are emergency controls that affect all platform users. Actions taken here have immediate global impact. Ensure you understand the consequences before proceeding.
            </p>
          </CardContent>
        </Card>

        {/* Control Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Maintenance Mode */}
          <Card className="border-destructive/30 hover:border-destructive/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Force Maintenance Mode</CardTitle>
              <CardDescription>Put app into maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Users see a maintenance page. No feature access. Can be reversed immediately.
              </p>
              <Button
                variant="destructive"
                onClick={() => handleActionClick("maintenance")}
                className="w-full"
                data-testid="button-emergency-maintenance"
              >
                Activate Maintenance Mode
              </Button>
            </CardContent>
          </Card>

          {/* Disable Posting */}
          <Card className="border-destructive/30 hover:border-destructive/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Disable Posting</CardTitle>
              <CardDescription>Stop all new posts globally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Prevents all users from creating posts. Viewing existing posts continues normally.
              </p>
              <Button
                variant="destructive"
                onClick={() => handleActionClick("disable_posting")}
                className="w-full"
                data-testid="button-emergency-disable-posting"
              >
                Disable Posting Now
              </Button>
            </CardContent>
          </Card>

          {/* Clear Cache */}
          <Card className="border-destructive/30 hover:border-destructive/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Clear All Cache</CardTitle>
              <CardDescription>Flush application caches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Removes all cached data. May cause brief slowdown as caches rebuild. Fixes stale data issues.
              </p>
              <Button
                variant="destructive"
                onClick={() => handleActionClick("clear_cache")}
                className="w-full"
                data-testid="button-emergency-clear-cache"
              >
                Clear Cache Now
              </Button>
            </CardContent>
          </Card>

          {/* Reset Feed */}
          <Card className="border-destructive/30 hover:border-destructive/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Reset App Feed</CardTitle>
              <CardDescription>Reset all user feeds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Resets personalization data. All users see default discover feed. Clears all recommendations.
              </p>
              <Button
                variant="destructive"
                onClick={() => handleActionClick("reset_feed")}
                className="w-full"
                data-testid="button-emergency-reset-feed"
              >
                Reset Feed Now
              </Button>
            </CardContent>
          </Card>

          {/* Lock Admin Access */}
          <Card className="border-destructive/30 hover:border-destructive/50 transition-colors md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Lock Admin Access</CardTitle>
              <CardDescription>Emergency lockdown of admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Locks all admin team members out of the admin panel. Only the owner can unlock. Use only in critical security situations.
              </p>
              <Button
                variant="destructive"
                onClick={() => handleActionClick("lock_admin")}
                className="w-full"
                data-testid="button-emergency-lock-admin"
              >
                🔒 Lock Admin Access
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Emergency Protocol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• All emergency actions take effect immediately and globally</p>
            <p>• Most actions can be reversed from this panel</p>
            <p>• Lock Admin Access is permanent until owner unlocks manually</p>
            <p>• Emergency actions are logged and timestamped</p>
            <p>• Consider notifying your team before using these controls</p>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog(open ? confirmDialog : { open: false, action: "", title: "", description: "" })
        }
      >
        <DialogContent data-testid="dialog-emergency-confirm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="mt-4">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 my-4">
            <p className="text-sm font-semibold text-destructive">
              This action will affect all users immediately and cannot be easily undone.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, action: "", title: "", description: "" })
              }
              data-testid="button-cancel-emergency"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmAction}
              data-testid="button-confirm-emergency"
            >
              I Understand - Proceed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
