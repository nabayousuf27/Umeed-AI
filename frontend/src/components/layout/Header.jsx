import { ArrowUpCircle, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";

const navConfigs = {
  visitor: [
    { label: "Home", path: "/" },
    { label: "Apply for Loan", path: "/borrower-auth" },
    { label: "Admin Portal", path: "/admin-auth" },
  ],
  borrower: [
    { label: "Home", path: "/" },
    { label: "Apply for Loan", path: "/loan-apply" },
    { label: "My Loans", path: "/my-loans" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin-dashboard" },
    { label: "Borrowers", path: "/admin/borrowers" },
  ],
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, role, logout } = useAuth();

  const currentPersona = isLoggedIn ? role ?? "visitor" : "visitor";
  const links = navConfigs[currentPersona] || navConfigs.visitor;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    if (role === "admin") {
      navigate("/admin-auth");
    } else {
      navigate("/borrower-auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to={role === "admin" ? "/admin-dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <ArrowUpCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Umeed AI</h1>
              <p className="text-xs text-muted-foreground">
                Small loans. Big hope.
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

