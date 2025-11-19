import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  CreditCard,
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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";

export default function LoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { borrowerId, isLoggedIn } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !borrowerId) {
      toast.info("Please sign in to view loan details");
      navigate("/borrower-auth");
      return;
    }

    // TODO: Replace with GET /loan/{id}
    const fetchLoan = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Mock loan data
        const mockLoan = {
          id: id || "LOAN-001",
          amount: 20000,
          status: "Active",
          dateIssued: "2024-01-10",
          installmentMonths: 2,
          riskScore: 240,
          totalPayable: 20840,
          paidAmount: 10420,
          remainingAmount: 10420,
          interestRate: 0.7,
          duration: 60,
        };

        setLoan(mockLoan);
      } catch (error) {
        console.error("Error fetching loan:", error);
        toast.error("Failed to load loan details");
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id, navigate, isLoggedIn, borrowerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return null;
  }

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Completed: "bg-blue-100 text-blue-800 border-blue-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/my-loans")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Loans
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Loan Details
              </h1>
              <p className="text-muted-foreground">Loan ID: {loan.id}</p>
            </div>
            {getStatusBadge(loan.status)}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Loan Information */}
          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Loan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="font-semibold">
                  PKR {loan.amount.toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Payable</span>
                <span className="font-semibold">
                  PKR {loan.totalPayable.toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paid Amount</span>
                <span className="font-semibold text-green-600">
                  PKR {loan.paidAmount.toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="font-semibold text-orange-600">
                  PKR {loan.remainingAmount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Loan Terms */}
          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Loan Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date Issued</span>
                <span className="font-semibold">{formatDate(loan.dateIssued)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold">{loan.duration} days</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Installment Plan
                </span>
                <span className="font-semibold">
                  {loan.installmentMonths}{" "}
                  {loan.installmentMonths === 1 ? "month" : "months"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interest Rate</span>
                <span className="font-semibold">{loan.interestRate}% daily</span>
              </div>
            </CardContent>
          </Card>

          {/* Risk Score */}
          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <span className="text-2xl font-bold text-primary">
                  {loan.riskScore}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {loan.status === "Active" && (
            <Card className="rounded-xl shadow-sm border border-border">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Manage your loan and view payment schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => navigate(`/installment/${loan.id}`)}
                >
                  <CreditCard className="h-4 w-4" />
                  View Installment Plan
                </Button>
                <Button variant="outline" className="w-full">
                  Make Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

