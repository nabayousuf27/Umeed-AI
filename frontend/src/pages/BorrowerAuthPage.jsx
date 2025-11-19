import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useAuth } from "../context/AuthContext";

export default function BorrowerAuthPage() {
  const navigate = useNavigate();
  const { loginBorrower } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    // TODO: Replace with POST /borrowers/signup using `payload`
    setTimeout(() => {
      const mockResponse = {
        token: `mock_token_${Date.now()}`,
        borrower_id: `borrower_${Date.now()}`,
      };

      loginBorrower({
        token: mockResponse.token,
        borrowerId: mockResponse.borrower_id,
      });

      toast.success(
        `Welcome back${payload.full_name ? `, ${payload.full_name}` : ""} — continue your application`
      );
      setIsLoading(false);
      navigate("/loan-apply");
    }, 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    // TODO: Replace with POST /borrowers/login using `payload`
    setTimeout(() => {
      const mockResponse = {
        token: `mock_token_${Date.now()}`,
        borrower_id: `borrower_${Date.now()}`,
      };

      loginBorrower({
        token: mockResponse.token,
        borrowerId: mockResponse.borrower_id,
      });

      toast.success(
        `Welcome back${payload.email ? `, ${payload.email.split("@")[0]}` : ""} — continue your application`
      );
      setIsLoading(false);
      navigate("/loan-apply");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-md">
          <Card className="animate-fade-in rounded-2xl shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">Welcome to Umeed AI</CardTitle>
              <CardDescription>
                Fast micro-loans with transparent scoring
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Signup</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email *</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="you@mail.com"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password *</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        type="text"
                        placeholder="e.g., Aisha Khan"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@mail.com"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+92 300 0000000"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnic">CNIC *</Label>
                      <Input
                        id="cnic"
                        name="cnic"
                        type="text"
                        placeholder="42101-1234567-1"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="e.g., 32"
                        required
                        min="18"
                        max="70"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a secure password"
                        required
                        className="h-12"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Create account & Continue"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

