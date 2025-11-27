import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Lock, Shield } from "lucide-react";

interface AdminLoginProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onClose, onLoginSuccess }: AdminLoginProps) {
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);

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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center z-50 p-4 backdrop-blur-md">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      </div>

      {/* Main Container */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          {/* Header Section */}
          <div className="relative px-6 py-8 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 hover:bg-primary/10 rounded-lg transition-colors duration-200"
              data-testid="button-close-admin-login"
            >
              <X className="h-5 w-5 text-primary" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                <p className="text-sm text-primary/70">Secure Panel</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2">Enter authentication credentials to proceed</p>
          </div>

          {/* Content Section */}
          <div className="relative px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
              <div className="space-y-2">
                <label htmlFor="admin-code" className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Lock className="h-4 w-4 text-primary" />
                  Authentication Code
                </label>
                <div className="relative">
                  <Input
                    id="admin-code"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      setError("");
                    }}
                    data-testid="input-admin-code"
                    className="bg-slate-800/50 border border-primary/20 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                </div>
                {error && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-xs text-red-400 font-medium" data-testid="text-admin-error">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-primary/20"
                data-testid="button-admin-submit"
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Admin Panel
              </Button>

              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full border border-primary/20 bg-transparent hover:bg-primary/5 text-slate-300 hover:text-primary font-medium py-3 rounded-lg transition-all duration-200"
                data-testid="button-admin-cancel"
              >
                Cancel
              </Button>
            </form>

            {/* Info Footer */}
            <div className="mt-8 pt-6 border-t border-primary/10">
              <p className="text-xs text-slate-500 text-center">
                This panel is restricted to authorized personnel only. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
