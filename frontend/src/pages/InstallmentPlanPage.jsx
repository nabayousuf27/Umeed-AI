import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { Button } from "../components/ui/button";
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
import { Progress } from "../components/ui/progress";
import { useAuth } from "../context/AuthContext";
import { getLoanDetail } from "../services/api";

export default function InstallmentPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { borrowerId, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !borrowerId) {
      toast.info("Please sign in first");
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
        setIsLoading(true);
        setError(null);
        
        const response = await getLoanDetail(parseInt(id, 10));
        const loanData = response.data;

        if (!loanData) {
          throw new Error("Loan not found");
        }

        // Verify borrower owns this loan
        if (loanData.borrower_id !== parseInt(borrowerId, 10)) {
          throw new Error("Access denied");
        }

        // Only show installment plan for active/completed loans
        if (loanData.status !== "active" && loanData.status !== "completed") {
          toast.info("Installment plan is only available for approved loans");
          navigate(`/loan/${id}`);
          return;
        }

        // Calculate installment plan
        const principal = loanData.loan_amount || 0;
        const interestRate = 0.042; // 4.2% total interest
        const totalPayable = principal * (1 + interestRate);
        const durationDays = loanData.loan_duration_days || 30;
        const numInstallments = Math.ceil(durationDays / 30);
        const installmentAmount = totalPayable / numInstallments;
        const principalPerInstallment = principal / numInstallments;
        const interestPerInstallment = (totalPayable - principal) / numInstallments;

        // Generate installments
        const installments = [];
        const startDate = loanData.approved_at ? new Date(loanData.approved_at) : new Date();
        
        for (let i = 0; i < numInstallments; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i + 1);
          
          installments.push({
            no: i + 1,
            due_date: dueDate.toISOString().split('T')[0],
            amount: Math.round(installmentAmount),
            principal: Math.round(principalPerInstallment),
            interest: Math.round(interestPerInstallment),
            status: "Upcoming", // Will be updated from repayments table later
          });
        }

        const mappedLoan = {
          borrower_id: loanData.borrower_id,
          principal: principal,
          daily_rate: 0.7, // Approximate daily rate
          duration: durationDays,
          total_payable: Math.round(totalPayable),
          installments: installments,
        };

        setLoan(mappedLoan);
      } catch (error) {
        console.error("Error fetching loan:", error);
        setError(error.response?.data?.detail || error.message || "Failed to load installment plan");
        toast.error(error.response?.data?.detail || "Failed to load installment plan");
        
        if (error.response?.status === 404 || error.message === "Access denied") {
          setTimeout(() => navigate("/my-loans"), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoan();
  }, [id, navigate, isLoggedIn, borrowerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">
            Loading installment plan...
          </p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
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

  if (!loan && !isLoading) {
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

  const paidCount = loan.installments.filter((i) => i.status === "Paid").length;
  const progress = (paidCount / loan.installments.length) * 100;

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Installment Plan</h1>
            <p className="text-muted-foreground">Loan ID: {id}</p>
          </div>

          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Loan Summary</CardTitle>
              <CardDescription>Your payment schedule and terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-6 md:grid-cols-4">
                <SummaryStat
                  label="Loan Principal"
                  value={`PKR ${loan.principal.toLocaleString()}`}
                />
                <SummaryStat
                  label="Daily Interest Rate"
                  value={`${loan.daily_rate}%`}
                />
                <SummaryStat label="Loan Duration" value={`${loan.duration} days`} />
                <SummaryStat
                  label="Total Payable"
                  value={`PKR ${loan.total_payable.toLocaleString()}`}
                  accent
                />
              </div>

              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">Payment Progress</span>
                  <span className="text-muted-foreground">
                    {paidCount} of {loan.installments.length} installments paid
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  💡 Pay on or before due date to avoid extra charges.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Installment Schedule</CardTitle>
                  <CardDescription>Detailed payment breakdown</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">No.</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.installments.map((installment) => (
                      <TableRow key={installment.no}>
                        <TableCell className="font-medium">
                          {installment.no}
                        </TableCell>
                        <TableCell>
                          {new Date(installment.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          PKR {installment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          PKR {installment.principal.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          PKR {installment.interest.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              installment.status === "Paid" ? "default" : "secondary"
                            }
                            className={
                              installment.status === "Paid" ? "bg-success" : ""
                            }
                          >
                            {installment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {installment.status === "Upcoming" && (
                            <Button size="sm" className="h-8">
                              <CreditCard className="mr-1 h-3 w-3" />
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const SummaryStat = ({ label, value, accent }) => (
  <div>
    <p className="mb-1 text-sm text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
  </div>
);

