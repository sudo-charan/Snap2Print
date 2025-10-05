import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Printer, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          toast.error("Please enter email and password");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Also store shop data for backward compatibility with dashboard
        localStorage.setItem("shop", JSON.stringify({
          shopId: data.user.shopId,
          name: data.user.shopName,
          _id: data.user.id
        }));

        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        if (!email || !password || !shopName || !location) {
          toast.error("Please fill in all fields");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password,
            shopName,
            location,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Also store shop data for backward compatibility with dashboard
        localStorage.setItem("shop", JSON.stringify({
          shopId: data.user.shopId,
          name: data.user.shopName,
          _id: data.user.id
        }));

        toast.success("Registration successful!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Snap2Print
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-foreground leading-tight">
            Revolutionize Your Xerox Center Operations
          </h2>

          <p className="text-lg text-muted-foreground">
            Say goodbye to WhatsApp transfers and long queues. Welcome to instant, secure, and hassle-free printing.
          </p>

          <div className="space-y-4 pt-4">
            {[
              "Generate unique QR codes for instant file transfers",
              "Real-time dashboard with print job management",
              "Track pending and completed orders effortlessly",
              "Secure, fast, and student-friendly solution"
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="w-full shadow-elevated animate-scale-in border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Login to access your xerox center dashboard"
                : "Set up your xerox center in minutes"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input
                      id="shopName"
                      placeholder="Enter your shop name"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter shop location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
