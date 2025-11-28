import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import splashLogo from "@assets/generated_images/transparent_outlined_african_continent_logo.png";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
  const [signupData, setSignupData] = useState({ email: "", username: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setIsLoading(true);
    try {
      // Check if username is available
      const usernameCheckRes = await fetch(`/api/auth/check-username/${signupData.username}`);
      const usernameCheckData = await usernameCheckRes.json();
      
      if (!usernameCheckData.available) {
        const errorMsg = "Username already taken. Choose a different one.";
        setSignupError(errorMsg);
        toast({ title: "Username unavailable", description: errorMsg, variant: "destructive", duration: 4000 });
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const userData = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        username: signupData.username,
        displayName: signupData.username,
        bio: "",
        location: "",
        avatar: "",
        website: "",
        profession: "",
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
      };
      
      // Register user to backend
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: signupData.username, password: signupData.password }),
        });
      } catch (e) {
        console.log("Backend sync note:", e);
      }
      
      // Fetch the actual database user to get their real UUID
      try {
        const userRes = await fetch(`/api/users/username/${signupData.username}`);
        if (userRes.ok) {
          const dbUser = await userRes.json();
          localStorage.setItem("currentUserId", dbUser.id);
          localStorage.setItem("currentUserData", JSON.stringify({
            ...dbUser,
            firebaseUid: userCredential.user.uid,
          }));
        } else {
          // Fallback if fetch fails
          localStorage.setItem("currentUserId", userCredential.user.uid);
          localStorage.setItem("currentUserData", JSON.stringify(userData));
        }
      } catch (e) {
        console.log("Could not fetch database user:", e);
        localStorage.setItem("currentUserId", userCredential.user.uid);
        localStorage.setItem("currentUserData", JSON.stringify(userData));
      }
      
      console.log("Signup:", userCredential.user);
      toast({ title: "Account created!", description: "Welcome to AfroSphere", duration: 3000 });
      onAuthComplete(true);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setSignupError(errorMsg);
      toast({ title: "Signup failed", description: errorMsg, variant: "destructive", duration: 4000 });
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      
      // Try to fetch user from database - need to find by getting any users and matching by Firebase UID
      let dbUser = null;
      try {
        // First try to get stored data from previous login/signup
        const storedData = localStorage.getItem("currentUserData");
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed.username) {
            // Try to fetch using the stored username
            const res = await fetch(`/api/users/username/${parsed.username}`);
            if (res.ok) {
              dbUser = await res.json();
            }
          }
        }
      } catch (e) {
        console.log("Could not fetch user by stored username");
      }
      
      // If we found a database user, use their real ID
      if (dbUser) {
        localStorage.setItem("currentUserId", dbUser.id);
        localStorage.setItem("currentUserData", JSON.stringify({
          ...dbUser,
          firebaseUid: userCredential.user.uid,
        }));
      } else {
        // Fallback: create minimal profile with Firebase UID (backward compatibility)
        const username = loginData.email.split('@')[0];
        localStorage.setItem("currentUserId", userCredential.user.uid);
        localStorage.setItem("currentUserData", JSON.stringify({
          id: userCredential.user.uid,
          email: userCredential.user.email,
          username: username,
          displayName: username,
          bio: "",
          location: "",
          avatar: "",
          firebaseUid: userCredential.user.uid,
        }));
      }
      
      console.log("Login:", userCredential.user);
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
          </TabsList>

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
                  <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-login-submit">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" data-testid="button-google-login">
                    Continue with Google
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Join the creative movement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-4 text-sm font-medium" data-testid="error-signup">⚠️ {signupError}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      data-testid="input-signup-email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="@yourcreativename"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      data-testid="input-signup-username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      data-testid="input-signup-password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-signup-submit">
                    {isLoading ? "Creating..." : "Create Account"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" data-testid="button-google-signup">
                    Continue with Google
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
