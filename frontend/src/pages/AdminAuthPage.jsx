import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useAuth } from "../context/AuthContext";

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    // TODO: Replace with POST /auth/admin/login using `payload`
    setTimeout(() => {
      const mockResponse = {
        admin_token: `admin_token_${Date.now()}`,
      };

      loginAdmin({ token: mockResponse.admin_token });

      toast.success(
        demoMode
          ? `Demo mode enabled for ${payload.email || "admin"}`
          : `Logged in as ${payload.email || "admin"}`
      );
      setIsLoading(false);
      navigate("/admin-dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-md">
          <Card className="animate-fade-in rounded-2xl border-2 border-primary/20 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription>Secure access for loan officers</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@umeedai.com"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your admin password"
                    required
                    className="h-12"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="demo-mode" className="text-sm font-medium">
                      Demo Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Load sample data for presentation
                    </p>
                  </div>
                  <Switch
                    id="demo-mode"
                    checked={demoMode}
                    onCheckedChange={setDemoMode}
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : "Login as Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

