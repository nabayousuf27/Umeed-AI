import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useAuth } from "../context/AuthContext";
import { getBorrowerProfile, applyForLoan } from "../services/api";

export default function LoanApplicationPage() {
  const navigate = useNavigate();
  const { borrowerId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [breadwinner, setBreadwinner] = useState("no");
  const [loanDuration, setLoanDuration] = useState("30");
  const [maritalStatus, setMaritalStatus] = useState("single");
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    cnic: "",
    age: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.info("Please sign in or sign up to apply for a loan");
      navigate("/borrower-auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await getBorrowerProfile();
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile. Please try again.");
        navigate("/borrower-auth");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!borrowerId) {
      toast.info("Please sign in again to continue your application");
      setIsLoading(false);
      navigate("/borrower-auth");
      return;
    }

    try {
      const formEntries = Object.fromEntries(new FormData(e.currentTarget).entries());
      const applicationPayload = {
        borrower_id: parseInt(borrowerId, 10),
        loan_amount: parseFloat(formEntries.loan_amount),
        loan_duration_days: parseInt(loanDuration, 10),
        monthly_income: parseFloat(formEntries.monthly_income),
        existing_loans: parseFloat(formEntries.existing_loans || 0),
        breadwinner,
        household_size: parseInt(formEntries.household_size, 10),
        dependents: parseInt(formEntries.dependents, 10),
        marital_status: maritalStatus,
        reason: formEntries.reason,
      };

      const response = await applyForLoan(applicationPayload);

      toast.success(
        `Application for PKR ${Number(applicationPayload.loan_amount).toLocaleString()} submitted successfully`
      );
      navigate(`/loan/${response.data.id}`);
    } catch (error) {
      console.error("Loan application error:", error);
      toast.error(
        error.response?.data?.detail || "Failed to submit application. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto mb-6 max-w-4xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Step 2 of 4 — Application</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          <Card className="h-fit rounded-2xl shadow-lg md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Applicant Details</CardTitle>
              <CardDescription>Auto-filled from your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Name" value={user.full_name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="CNIC" value={user.cnic} />
              <InfoRow label="Age" value={user.age} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">
                Apply for a Micro-Loan
              </CardTitle>
              <CardDescription>
                Fill in your financial details and loan request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <section>
                  <SectionHeading>Financial Information</SectionHeading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Monthly Income (PKR) *" id="monthly_income">
                      <Input
                        id="monthly_income"
                        name="monthly_income"
                        type="number"
                        placeholder="PKR 50,000"
                        required
                        min="0"
                        className="h-11"
                      />
                    </Field>

                    <Field
                      label="Existing Monthly Loans (PKR) *"
                      id="existing_loans"
                    >
                      <Input
                        id="existing_loans"
                        name="existing_loans"
                        type="number"
                        placeholder="Total monthly repayments"
                        required
                        min="0"
                        className="h-11"
                      />
                    </Field>

                    <Field label="Are you the only breadwinner? *" id="breadwinner">
                      <Select value={breadwinner} onValueChange={setBreadwinner}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Household Size *" id="household_size">
                      <Input
                        id="household_size"
                        name="household_size"
                        type="number"
                        placeholder="Number of people"
                        required
                        min="1"
                        className="h-11"
                      />
                    </Field>

                    <Field label="Number of Dependents *" id="dependents">
                      <Input
                        id="dependents"
                        name="dependents"
                        type="number"
                        placeholder="e.g., 3"
                        required
                        min="0"
                        className="h-11"
                      />
                    </Field>

                    <Field label="Marital Status *" id="marital_status">
                      <Select
                        value={maritalStatus}
                        onValueChange={setMaritalStatus}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </section>

                <section>
                  <SectionHeading>Loan Request</SectionHeading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Loan Amount (PKR) *" id="loan_amount">
                      <Input
                        id="loan_amount"
                        name="loan_amount"
                        type="number"
                        placeholder="PKR 20,000"
                        required
                        min="1000"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tip: Request an amount you can repay comfortably within
                        chosen duration.
                      </p>
                    </Field>

                    <Field label="Loan Duration *" id="loan_duration_days">
                      <Select
                        value={loanDuration}
                        onValueChange={setLoanDuration}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="reason">Reason for Loan *</Label>
                      <Textarea
                        id="reason"
                        name="reason"
                        placeholder="Please describe why you need this loan..."
                        required
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </section>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12"
                    disabled={isLoading}
                  >
                    Save Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const SectionHeading = ({ children }) => (
  <h3 className="mb-4 text-lg font-semibold">{children}</h3>
);

const Field = ({ label, id, children }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value}</p>
  </div>
);

