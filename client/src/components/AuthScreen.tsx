import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import splashLogo from "@assets/generated_images/transparent_outlined_african_continent_logo.png";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthScreenProps {
  onAuthComplete: (isNewSignup: boolean) => void;
  onLogoClick?: () => void;
}

const getErrorMessage = (error: any): string => {
  const code = error?.code || "";
  const messages: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/operation-not-allowed": "Account creation is currently disabled.",
    "auth/too-many-requests": "Too many login attempts. Try again later.",
  };
  return messages[code] || (error?.message || "An error occurred. Please try again.");
};

export default function AuthScreen({ onAuthComplete, onLogoClick }: AuthScreenProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const generateUsernameFromEmail = (email: string) => {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    return base || `user${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setLoginError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Find user by Firebase UID or email
      let dbUser = null;
      try {
        const usersRes = await fetch('/api/users/all');
        if (usersRes.ok) {
          const allUsers = await usersRes.json();
          dbUser = allUsers.find((u: any) => u.firebaseUid === userCredential.user.uid);
          
          if (!dbUser && userCredential.user.email) {
            const emailDomain = userCredential.user.email.split('@')[0];
            dbUser = allUsers.find((u: any) => u.username === emailDomain || u.username === userCredential.user.email);
          }
        }
      } catch (e) {
        console.log("Could not fetch all users");
      }
      
      // If user not found, create new account
      if (!dbUser) {
        try {
          let username = generateUsernameFromEmail(userCredential.user.email || "user");
          
          // Check if username is available
          let usernameCheckRes = await fetch(`/api/auth/check-username/${username}`);
          let usernameCheckData = await usernameCheckRes.json();
          
          // If taken, add random suffix
          if (!usernameCheckData.available) {
            username = `${username}${Math.floor(Math.random() * 10000)}`;
          }
          
          // Create new user
          const createRes = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              password: userCredential.user.uid,
              firebaseUid: userCredential.user.uid,
            }),
          });
          
          if (createRes.ok) {
            dbUser = await createRes.json();
            localStorage.setItem("currentUserId", dbUser.id);
            localStorage.setItem("currentUserData", JSON.stringify({
              ...dbUser,
              firebaseUid: userCredential.user.uid,
            }));
            toast({ title: "Account created!", description: "Welcome to AfroSphere", duration: 3000 });
            onAuthComplete(true);
          } else {
            throw new Error("Could not create account");
          }
        } catch (signupError) {
          console.error("Google signup error:", signupError);
          throw new Error("Failed to create account with Google");
        }
      } else {
        // Existing user - log them in
        localStorage.setItem("currentUserId", dbUser.id);
        // Update firebaseUid if not set
        if (!dbUser.firebaseUid) {
          try {
            await fetch(`/api/users/${dbUser.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ firebaseUid: userCredential.user.uid }),
            });
          } catch (e) {
            console.log("Could not update firebaseUid");
          }
        }
        localStorage.setItem("currentUserData", JSON.stringify({
          ...dbUser,
          firebaseUid: userCredential.user.uid,
        }));
        toast({ title: "Welcome back!", description: "Successfully signed in", duration: 3000 });
        onAuthComplete(false);
      }
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setLoginError(errorMsg);
      toast({ title: "Google login failed", description: errorMsg, variant: "destructive", duration: 4000 });
      console.error("Google login error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      
      // Fetch ALL users and find one matching this Firebase UID
      let dbUser = null;
      try {
        const usersRes = await fetch('/api/users/all');
        if (usersRes.ok) {
          const allUsers = await usersRes.json();
          // Find user by Firebase UID (new users)
          dbUser = allUsers.find((u: any) => u.firebaseUid === userCredential.user.uid);
          
          // If not found, try by email (existing users without firebaseUid)
          if (!dbUser && userCredential.user.email) {
            // For existing users, we need to match by email domain
            const emailDomain = userCredential.user.email.split('@')[0];
            dbUser = allUsers.find((u: any) => {
              // Check if username matches email prefix (common case for old users)
              return u.username === emailDomain || u.username === userCredential.user.email;
            });
          }
        }
      } catch (e) {
        console.log("Could not fetch all users");
      }
      
      // If still not found, try by stored username (fallback)
      if (!dbUser) {
        try {
          const storedData = localStorage.getItem("currentUserData");
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.username) {
              const res = await fetch(`/api/users/username/${parsed.username}`);
              if (res.ok) {
                dbUser = await res.json();
              }
            }
          }
        } catch (e) {
          console.log("Could not fetch user by stored username");
        }
      }
      
      // Store the REAL database user
      if (dbUser && dbUser.id) {
        localStorage.setItem("currentUserId", dbUser.id);
        // Update user's firebaseUid in database if not already set
        if (!dbUser.firebaseUid) {
          try {
            await fetch(`/api/users/${dbUser.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ firebaseUid: userCredential.user.uid }),
            });
          } catch (e) {
            console.log("Could not update firebaseUid");
          }
        }
        localStorage.setItem("currentUserData", JSON.stringify({
          ...dbUser,
          firebaseUid: userCredential.user.uid,
        }));
      } else {
        // User not found - this shouldn't happen for existing users
        throw new Error("User account not found. Please sign up instead.");
      }
      
      toast({ title: "Welcome back!", description: "Successfully signed in", duration: 3000 });
      onAuthComplete(false);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setLoginError(errorMsg);
      toast({ title: "Login failed", description: errorMsg, variant: "destructive", duration: 4000 });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={onLogoClick}
            className="bg-transparent border-0 p-0 cursor-default hover:bg-transparent active:bg-transparent mb-2"
            data-testid="button-auth-logo"
            style={{ appearance: "none", WebkitAppearance: "none" }}
          >
            <img src={splashLogo} alt="AfroSphere" className="w-20 h-20 select-none" data-testid="img-auth-logo" draggable="false" />
          </button>
          <h1 className="text-3xl font-bold" data-testid="text-auth-title">AfroSphere</h1>
          <p className="text-muted-foreground mt-2">Africa's Creative Home</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Login to continue creating</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-4 text-sm font-medium" data-testid="error-login">⚠️ {loginError}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      data-testid="input-login-email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      data-testid="input-login-password"
                      required
                    />
                  </div>
                  <button type="button" className="text-sm text-primary hover:underline" data-testid="button-forgot-password">
                    Forgot password?
                  </button>
                  <Button type="submit" disabled={isLoading || googleLoading} className="w-full" data-testid="button-login-submit">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={googleLoading || isLoading} data-testid="button-google-login">
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
