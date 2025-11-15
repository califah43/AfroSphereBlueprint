import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronRight, X, LogOut } from "lucide-react";
import { useState } from "react";

interface SettingsProps {
  onClose: () => void;
  onLogout?: () => void;
}

export default function Settings({ onClose, onLogout }: SettingsProps) {
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-settings">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold ml-2" data-testid="text-settings-title">Settings</h2>
      </div>

      <div className="max-w-md mx-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Account</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3 hover-elevate rounded-lg" data-testid="button-change-password">
                <span>Change Password</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover-elevate rounded-lg" data-testid="button-email-preferences">
                <span>Email Preferences</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Privacy</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 rounded-lg" data-testid="setting-private-account">
                <div>
                  <Label htmlFor="private-account" className="font-normal cursor-pointer">
                    Private Account
                  </Label>
                  <p className="text-xs text-muted-foreground">Only followers can see your posts</p>
                </div>
                <Switch
                  id="private-account"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  data-testid="switch-private-account"
                />
              </div>
              <button className="w-full flex items-center justify-between p-3 hover-elevate rounded-lg" data-testid="button-blocked-users">
                <span>Blocked Users</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Support</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3 hover-elevate rounded-lg" data-testid="button-help">
                <span>Help Center</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover-elevate rounded-lg" data-testid="button-report-issue">
                <span>Report an Issue</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover-elevate rounded-lg" data-testid="button-about">
                <span>About AfroSphere</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-4">
            Version 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
