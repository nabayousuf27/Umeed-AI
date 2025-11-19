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
import { getLoanDetail } from "../services/api";

export default function LoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { borrowerId, isLoggedIn, role } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please sign in to view loan details");
      navigate("/borrower-auth");
      return;
    }

    if (!id) {
      toast.error("Invalid loan ID");
      navigate("/my-loans");
      return;
    }

    const fetchLoan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getLoanDetail(parseInt(id, 10));
        const loanData = response.data;
        
        if (!loanData) {
          throw new Error("Loan not found");
        }

        // Calculate derived values
        const loanAmount = loanData.loan_amount || 0;
        const interestRate = 0.042; // 4.2% interest rate (can be made configurable)
        const totalPayable = loanAmount * (1 + interestRate);
        
        // For now, paid amount is 0 (will be calculated from repayments later)
        const paidAmount = 0;
        const remainingAmount = totalPayable - paidAmount;
        
        // Calculate installment months from duration
        const durationDays = loanData.loan_duration_days || 30;
        const installmentMonths = Math.ceil(durationDays / 30);
        
        // Map API response to frontend format
        const mappedLoan = {
          id: loanData.id,
          amount: loanAmount,
          status: loanData.status === "pending" ? "Pending" :
                  loanData.status === "active" ? "Active" :
                  loanData.status === "completed" ? "Completed" : "Rejected",
          dateIssued: loanData.created_at || loanData.approved_at,
          installmentMonths: installmentMonths,
          riskScore: loanData.final_score || loanData.ai_score || 0,
          riskCategory: loanData.risk_category || "Medium",
          totalPayable: Math.round(totalPayable),
          paidAmount: paidAmount,
          remainingAmount: Math.round(remainingAmount),
          interestRate: (interestRate * 100).toFixed(2),
          duration: durationDays,
          // Additional fields from API
          monthlyIncome: loanData.monthly_income,
          existingLoans: loanData.existing_loans,
          breadwinner: loanData.breadwinner,
          householdSize: loanData.household_size,
          dependents: loanData.dependents,
          maritalStatus: loanData.marital_status,
          reason: loanData.reason,
          adminNotes: loanData.admin_notes,
          rejectionReason: loanData.rejection_reason,
          approvedAt: loanData.approved_at,
          rejectedAt: loanData.rejected_at,
          completedAt: loanData.completed_at,
        };

        setLoan(mappedLoan);
      } catch (error) {
        console.error("Error fetching loan:", error);
        setError(error.response?.data?.detail || error.message || "Failed to load loan details");
        toast.error(error.response?.data?.detail || "Failed to load loan details");
        
        // If 404 or 403, redirect back
        if (error.response?.status === 404 || error.response?.status === 403) {
          setTimeout(() => navigate("/my-loans"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id, navigate, isLoggedIn, borrowerId, role]);

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

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="mb-4 text-2xl font-bold text-destructive">Error</h2>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/my-loans")}>
              Back to My Loans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!loan && !loading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="mb-4 text-2xl font-bold">Loan Not Found</h2>
            <p className="mb-6 text-muted-foreground">
              The loan you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate("/my-loans")}>
              Back to My Loans
            </Button>
          </div>
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
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status}
      </Badge>
    );
  };
  
  const getRiskBadge = (category) => {
    const variants = {
      Low: "bg-green-100 text-green-800 border-green-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      High: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge variant="outline" className={variants[category] || ""}>
        {category} Risk
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

          {/* Risk Assessment */}
          <Card className="rounded-xl shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <span className="text-2xl font-bold text-primary">
                  {loan.riskScore ? Math.round(loan.riskScore) : "N/A"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Category</span>
                {loan.riskCategory && getRiskBadge(loan.riskCategory)}
              </div>
            </CardContent>
          </Card>
          
          {/* Application Details */}
          {loan.reason && (
            <Card className="rounded-xl shadow-sm border border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Reason for Loan</span>
                  <p className="mt-1 text-sm">{loan.reason}</p>
                </div>
                {loan.monthlyIncome && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Monthly Income</span>
                        <p className="mt-1 font-semibold">PKR {loan.monthlyIncome.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Existing Loans</span>
                        <p className="mt-1 font-semibold">PKR {loan.existingLoans?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Household Size</span>
                        <p className="mt-1 font-semibold">{loan.householdSize} people</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Dependents</span>
                        <p className="mt-1 font-semibold">{loan.dependents}</p>
                      </div>
                    </div>
                  </>
                )}
                {loan.adminNotes && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Admin Notes</span>
                      <p className="mt-1 text-sm">{loan.adminNotes}</p>
                    </div>
                  </>
                )}
                {loan.rejectionReason && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Rejection Reason</span>
                      <p className="mt-1 text-sm text-destructive">{loan.rejectionReason}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

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
          
          {loan.status === "Pending" && (
            <Card className="rounded-xl shadow-sm border border-border md:col-span-2">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>
                  Your loan application is under review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your loan application has been submitted and is currently being reviewed by our team. 
                  You will be notified once a decision has been made.
                </p>
              </CardContent>
            </Card>
          )}
          
          {loan.status === "Rejected" && loan.rejectionReason && (
            <Card className="rounded-xl shadow-sm border border-red-200 bg-red-50 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-destructive">Application Rejected</CardTitle>
                <CardDescription>
                  Your loan application was not approved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">Rejection Reason:</p>
                <p className="text-sm text-muted-foreground">{loan.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


