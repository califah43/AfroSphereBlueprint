import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Lock } from "lucide-react";

interface AdminLoginProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onClose, onLoginSuccess }: AdminLoginProps) {
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode.toLowerCase() === "afrosphere2024" || adminCode === "admin") {
      onLoginSuccess();
      setAdminCode("");
      setError("");
    } else {
      setError("Invalid admin code");
      setAdminCode("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-primary/50">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover-elevate rounded"
            data-testid="button-close-admin-login"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Admin Access</CardTitle>
          </div>
          <CardDescription>Enter the admin code to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-code">Admin Code</Label>
              <Input
                id="admin-code"
                type="password"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value);
                  setError("");
                }}
                data-testid="input-admin-code"
              />
              {error && <p className="text-xs text-red-500" data-testid="text-admin-error">{error}</p>}
            </div>
            <Button type="submit" className="w-full" data-testid="button-admin-submit">
              Access Admin Panel
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full" data-testid="button-admin-cancel">
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
