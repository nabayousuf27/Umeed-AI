import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { getAdminLoanDetail, approveLoan, rejectLoan } from "../services/api";

export default function LoanProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [manualScore, setManualScore] = useState("");
  const [loanToIncomeWeight, setLoanToIncomeWeight] = useState([50]);
  const [debtWeight, setDebtWeight] = useState([45]);
  const [ageWeight, setAgeWeight] = useState([40]);
  const [loyaltyWeight, setLoyaltyWeight] = useState([30]);

  useEffect(() => {
    if (role !== "admin") {
      toast.error("Admin access required");
      navigate("/admin-auth");
      return;
    }

    const fetchLoan = async () => {
      try {
        setLoading(true);
        const response = await getAdminLoanDetail(parseInt(id, 10));
        const loanData = response.data;

        if (!loanData) {
          throw new Error("Loan not found");
        }

        // Map API data to application format
        const mappedApplication = {
          id: loanData.id,
          borrower: loanData.borrower || {
            name: "Unknown",
            email: "N/A",
            phone: "N/A",
            cnic: "N/A",
            age: 0,
          },
          financial: {
            monthly_income: loanData.monthly_income || 0,
            existing_loans: loanData.existing_loans || 0,
            breadwinner: loanData.breadwinner === "yes" ? "Yes" : "No",
            household_size: loanData.household_size || 0,
            dependents: loanData.dependents || 0,
            marital_status: loanData.marital_status || "N/A",
          },
          loan: {
            amount: loanData.loan_amount || 0,
            duration_days: loanData.loan_duration_days || 0,
            reason: loanData.reason || "No reason provided",
          },
          scoring: {
            ai_score: loanData.ai_score || 0,
            manual_score: loanData.manual_score || null,
            final_score: loanData.final_score || loanData.ai_score || 0,
            risk_category: loanData.risk_category || "Medium",
            decision: loanData.status === "pending" ? "Pending" :
                     loanData.status === "active" ? "Approved" :
                     loanData.status === "completed" ? "Approved" :
                     loanData.status === "rejected" ? "Rejected" : "Pending",
          },
          status: loanData.status,
          admin_notes: loanData.admin_notes || "",
          rejection_reason: loanData.rejection_reason || "",
          created_at: loanData.created_at,
          approved_at: loanData.approved_at,
          rejected_at: loanData.rejected_at,
        };

        setApplication(mappedApplication);
        setAdminNotes(mappedApplication.admin_notes);
        if (mappedApplication.scoring.manual_score) {
          setManualScore(mappedApplication.scoring.manual_score.toString());
        }
      } catch (error) {
        console.error("Error fetching loan:", error);
        toast.error(error.response?.data?.detail || "Failed to load loan details");
        navigate("/admin-dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLoan();
    }
  }, [id, navigate, role]);

  const handleApprove = async () => {
    try {
      const approvalData = {
        admin_notes: adminNotes || undefined,
        manual_score: manualScore ? parseFloat(manualScore) : undefined,
      };

      await approveLoan(parseInt(id, 10), approvalData);
      toast.success("Loan approved successfully!");
      
      // Refresh loan data
      const response = await getAdminLoanDetail(parseInt(id, 10));
      const loanData = response.data;
      
      // Update application state
      setApplication(prev => ({
        ...prev,
        scoring: {
          ...prev.scoring,
          decision: "Approved",
          manual_score: loanData.manual_score || prev.scoring.manual_score,
          final_score: loanData.final_score || prev.scoring.final_score,
        },
        status: "active",
        admin_notes: loanData.admin_notes || adminNotes,
      }));
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error(error.response?.data?.detail || "Failed to approve loan");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      const rejectionData = {
        rejection_reason: rejectionReason,
        admin_notes: adminNotes || undefined,
      };

      await rejectLoan(parseInt(id, 10), rejectionData);
      toast.success("Loan rejected");
      
      // Refresh loan data
      const response = await getAdminLoanDetail(parseInt(id, 10));
      const loanData = response.data;
      
      // Update application state
      setApplication(prev => ({
        ...prev,
        scoring: {
          ...prev.scoring,
          decision: "Rejected",
        },
        status: "rejected",
        rejection_reason: loanData.rejection_reason || rejectionReason,
        admin_notes: loanData.admin_notes || adminNotes,
      }));
      
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting loan:", error);
      toast.error(error.response?.data?.detail || "Failed to reject loan");
    }
  };

  const handleMarkReview = () => {
    toast.info("Loan is already marked for review");
  };

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

  if (!application) {
    return null;
  }

  // Build history from timestamps
  const history = [];
  if (application.created_at) {
    history.push({
      timestamp: new Date(application.created_at).toLocaleString(),
      event: "Application submitted",
      user: application.borrower.name,
    });
  }
  if (application.scoring.ai_score) {
    history.push({
      timestamp: application.created_at ? new Date(application.created_at).toLocaleString() : "N/A",
      event: "AI scoring completed",
      user: "System",
    });
  }
  if (application.approved_at) {
    history.push({
      timestamp: new Date(application.approved_at).toLocaleString(),
      event: "Loan approved",
      user: "Admin",
    });
  }
  if (application.rejected_at) {
    history.push({
      timestamp: new Date(application.rejected_at).toLocaleString(),
      event: "Loan rejected",
      user: "Admin",
    });
  }

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Loan Application Profile</h1>
          <p className="text-muted-foreground">Application ID: {id}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Borrower Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoBlock label="Full Name" value={application.borrower.name} />
              <Separator />
              <InfoBlock label="Email" value={application.borrower.email} />
              <InfoBlock label="Phone" value={application.borrower.phone} />
              <InfoBlock label="CNIC" value={application.borrower.cnic} />
              <InfoBlock label="Age" value={application.borrower.age} />

              <Separator className="my-4" />

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Financial Details
                </p>
                <div className="space-y-2 text-sm">
                  <Stat label="Monthly Income" value={`PKR ${application.financial.monthly_income.toLocaleString()}`} />
                  <Stat label="Existing Loans" value={`PKR ${application.financial.existing_loans.toLocaleString()}`} />
                  <Stat label="Breadwinner" value={application.financial.breadwinner} />
                  <Stat label="Household Size" value={application.financial.household_size} />
                  <Stat label="Dependents" value={application.financial.dependents} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Loan &amp; Scoring Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Loan Request
                </p>
                <div className="space-y-2">
                  <Stat
                    label="Amount"
                    value={`PKR ${application.loan.amount.toLocaleString()}`}
                    bold
                  />
                  <Stat label="Duration" value={`${application.loan.duration_days} days`} />
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Reason:
                  </p>
                  <p className="rounded bg-muted p-3 text-sm">
                    {application.loan.reason}
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Current Scoring
                </p>
                <div className="space-y-3">
                  <Stat label="Final Score" value={application.scoring.final_score} bold large />
                  <Stat label="AI Score" value={application.scoring.ai_score} />
                  <Stat label="Manual Score" value={application.scoring.manual_score} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk:</span>
                    <Badge className="bg-success">{application.scoring.risk_category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Decision:</span>
                    <Badge className="bg-success">{application.scoring.decision}</Badge>
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  Manual Score Adjustment
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="manual-score" className="text-xs">Manual Score (0-200)</Label>
                    <Input
                      id="manual-score"
                      type="number"
                      min="0"
                      max="200"
                      value={manualScore}
                      onChange={(e) => setManualScore(e.target.value)}
                      placeholder="Enter manual score"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      This will be added to the AI score to calculate the final score.
                    </p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label
                  htmlFor="admin-notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Admin Notes
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add internal notes about this application..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                {application.status === "pending" && (
                  <>
                    <Button
                      onClick={handleApprove}
                      className="h-11 w-full bg-success text-success-foreground hover:bg-success/90"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Application
                    </Button>
                    <div>
                      <Label htmlFor="rejection-reason" className="mb-2 block text-sm">
                        Rejection Reason (Required for rejection)
                      </Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                        className="mb-2 resize-none"
                      />
                      <Button
                        onClick={handleReject}
                        variant="destructive"
                        className="h-11 w-full"
                        disabled={!rejectionReason.trim()}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Application
                      </Button>
                    </div>
                  </>
                )}
                {application.status !== "pending" && (
                  <div className="rounded-lg border bg-muted p-4">
                    <p className="text-sm font-medium">
                      Status: <Badge className="ml-2">{application.scoring.decision}</Badge>
                    </p>
                    {application.status === "rejected" && application.rejection_reason && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Reason: {application.rejection_reason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-sm font-medium">Application History</p>
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((event, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            {event.timestamp}
                          </p>
                          <p className="text-sm">{event.event}</p>
                          <p className="text-xs text-muted-foreground">
                            By: {event.user}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No history available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const InfoBlock = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value}</p>
  </div>
);

const Stat = ({ label, value, bold, large }) => (
  <div className="flex justify-between">
    <span className="text-sm">{label}:</span>
    <span
      className={`${bold ? "font-bold" : "font-semibold"} ${
        large ? "text-2xl" : ""
      }`}
    >
      {value}
    </span>
  </div>
);


