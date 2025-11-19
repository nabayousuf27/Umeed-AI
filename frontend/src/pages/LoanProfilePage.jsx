import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
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

export default function LoanProfilePage() {
  const { id } = useParams();
  const [adminNotes, setAdminNotes] = useState("");
  const [loanToIncomeWeight, setLoanToIncomeWeight] = useState([50]);
  const [debtWeight, setDebtWeight] = useState([45]);
  const [ageWeight, setAgeWeight] = useState([40]);
  const [loyaltyWeight, setLoyaltyWeight] = useState([30]);

  const application = {
    id: "APP-001",
    borrower: {
      name: "Aisha Khan",
      email: "aisha@example.com",
      phone: "+92 300 1234567",
      cnic: "42101-1234567-1",
      age: 32,
    },
    financial: {
      monthly_income: 50000,
      existing_loans: 5000,
      breadwinner: "Yes",
      household_size: 4,
      dependents: 2,
      marital_status: "Married",
    },
    loan: {
      amount: 20000,
      duration_days: 60,
      reason:
        "Need funds for small business expansion - purchasing inventory for my clothing boutique.",
    },
    scoring: {
      ai_score: 75,
      manual_score: 165,
      final_score: 240,
      risk_category: "Low",
      decision: "Approved",
    },
    history: [
      { timestamp: "2024-01-10 14:32", event: "Application submitted", user: "Aisha Khan" },
      { timestamp: "2024-01-10 14:35", event: "AI scoring completed", user: "System" },
      { timestamp: "2024-01-10 14:36", event: "Manual review initiated", user: "Admin" },
    ],
  };

  const handleApprove = () => {
    toast.success("Application approved successfully!");
    console.log("Approved with notes:", adminNotes);
  };

  const handleReject = () => {
    if (!adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    toast.error("Application rejected");
    console.log("Rejected with notes:", adminNotes);
  };

  const handleMarkReview = () => {
    toast.info("Marked for manual review");
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
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
                  Adjust Scoring Weights
                </p>
                <SliderBlock
                  label={`Loan-to-Income: ${loanToIncomeWeight}`}
                  value={loanToIncomeWeight}
                  onChange={setLoanToIncomeWeight}
                />
                <SliderBlock
                  label={`Debt Score: ${debtWeight}`}
                  value={debtWeight}
                  onChange={setDebtWeight}
                />
                <SliderBlock
                  label={`Age Score: ${ageWeight}`}
                  value={ageWeight}
                  onChange={setAgeWeight}
                />
                <SliderBlock
                  label={`Loyalty Score: ${loyaltyWeight}`}
                  value={loyaltyWeight}
                  onChange={setLoyaltyWeight}
                />
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
                <Button
                  onClick={handleApprove}
                  className="h-11 w-full bg-success text-success-foreground hover:bg-success/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Application
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="h-11 w-full"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
                <Button
                  onClick={handleMarkReview}
                  variant="outline"
                  className="h-11 w-full"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Mark for Review
                </Button>
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-sm font-medium">Application History</p>
                <div className="space-y-3">
                  {application.history.map((event, index) => (
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
                  ))}
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

const SliderBlock = ({ label, value, onChange }) => (
  <div>
    <Label className="text-xs">{label}</Label>
    <Slider
      value={value}
      onValueChange={onChange}
      max={100}
      step={1}
      className="mt-2"
    />
  </div>
);

