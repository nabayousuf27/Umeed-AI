import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
  ChevronRight,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useAuth } from "../context/AuthContext";

// Mock data - replace with API call later
const mockLoans = [
  {
    id: "LOAN-001",
    amount: 20000,
    status: "Active",
    dateIssued: "2024-01-10",
    installmentMonths: 2,
    riskScore: 240,
    totalPayable: 20840,
    paidAmount: 10420,
  },
  {
    id: "LOAN-002",
    amount: 15000,
    status: "Completed",
    dateIssued: "2023-11-15",
    installmentMonths: 1,
    riskScore: 235,
    totalPayable: 15105,
    paidAmount: 15105,
  },
  {
    id: "LOAN-003",
    amount: 25000,
    status: "Rejected",
    dateIssued: "2023-10-20",
    installmentMonths: 0,
    riskScore: 120,
    totalPayable: 0,
    paidAmount: 0,
  },
  {
    id: "LOAN-004",
    amount: 18000,
    status: "Active",
    dateIssued: "2024-02-05",
    installmentMonths: 1,
    riskScore: 220,
    totalPayable: 18126,
    paidAmount: 9063,
  },
  {
    id: "LOAN-005",
    amount: 12000,
    status: "Completed",
    dateIssued: "2023-09-10",
    installmentMonths: 1,
    riskScore: 245,
    totalPayable: 12084,
    paidAmount: 12084,
  },
];

export default function MyLoansPage() {
  const navigate = useNavigate();
  const { borrowerId, isLoggedIn } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !borrowerId) {
      toast.info("Please sign in to view your loans");
      navigate("/borrower-auth");
      return;
    }

    // TODO: Replace with GET /borrower/loans
    const fetchLoans = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setLoans(mockLoans);
      } catch (error) {
        console.error("Error fetching loans:", error);
        toast.error("Failed to load loans");
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [navigate, isLoggedIn, borrowerId]);

  // Calculate summary statistics
  const summary = {
    active: loans.filter((loan) => loan.status === "Active").length,
    completed: loans.filter((loan) => loan.status === "Completed").length,
    rejected: loans.filter((loan) => loan.status === "Rejected").length,
    totalBorrowed: loans
      .filter((loan) => loan.status !== "Rejected")
      .reduce((sum, loan) => sum + loan.amount, 0),
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Completed: "bg-blue-100 text-blue-800 border-blue-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };

    const icons = {
      Active: <Activity className="h-3 w-3" />,
      Completed: <CheckCircle2 className="h-3 w-3" />,
      Rejected: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1.5 ${variants[status] || ""}`}
      >
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = (loanId) => {
    // Navigate to loan detail page
    navigate(`/loan/${loanId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">My Loans</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Loans</h1>
          <p className="text-muted-foreground">
            View all your current and past loans.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Active Loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{summary.active}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Completed Loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {summary.completed}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Rejected Loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {summary.rejected}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total Amount Borrowed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                PKR {summary.totalBorrowed.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan List Table */}
        <Card className="rounded-xl shadow-sm border border-border">
          <CardHeader>
            <CardTitle>Loan History</CardTitle>
            <CardDescription>
              All your loan applications and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loans.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  You have no loans yet.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Start by applying for your first loan.
                </p>
                <Button onClick={() => navigate("/loan-apply")}>
                  Apply for Loan
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Issued</TableHead>
                      <TableHead>Installment Plan</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow
                        key={loan.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{loan.id}</TableCell>
                        <TableCell className="font-semibold">
                          PKR {loan.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(loan.dateIssued)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {loan.installmentMonths > 0 ? (
                            <Badge variant="outline" className="gap-1">
                              {loan.installmentMonths}{" "}
                              {loan.installmentMonths === 1 ? "month" : "months"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {loan.riskScore ? (
                            <span className="text-sm font-medium">
                              {loan.riskScore}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {loan.status !== "Rejected" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(loan.id)}
                              className="gap-2"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No details
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

