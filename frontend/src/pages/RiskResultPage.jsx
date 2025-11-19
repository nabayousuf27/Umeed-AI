import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock, Download, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { LoadingSpinner } from "../components/ui/loading-spinner";

export default function RiskResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("umeed_token");
    const borrower_id = localStorage.getItem("umeed_borrower_id");

    if (!token) {
      toast.info("Please sign in first");
      navigate("/borrower-auth");
      return;
    }

    // TODO: Replace with GET /loan/{id}/result
    setTimeout(() => {
      const mockResult = {
        borrower_id,
        ai_score: 75,
        manual_score: 165,
        final_score: 240,
        risk_category: "Low",
        decision: "Approved",
        explanation:
          "Based on your stable income, low existing debt, and responsible financial profile, you qualify for this loan with favorable terms.",
        details: {
          loan_to_income: { score: 50, ratio: "40%" },
          existing_debt: { score: 45, amount: "PKR 5,000" },
          age_score: { score: 40, age: 32 },
          loyalty_score: { score: 30, status: "New Customer" },
        },
      };

      if (mockResult.borrower_id !== borrower_id) {
        toast.error("Access denied");
        navigate("/loan-apply");
        return;
      }

      setResult(mockResult);
      setIsLoading(false);

      if (mockResult.decision === "Approved") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 800);
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const decisionIcon = {
    Approved: <CheckCircle2 className="h-8 w-8 text-success" />,
    Rejected: <XCircle className="h-8 w-8 text-destructive" />,
    Review: <Clock className="h-8 w-8 text-warning" />,
  }[result.decision] || <Clock className="h-8 w-8 text-warning" />;

  const decisionBadge =
    {
      Approved: "bg-success text-success-foreground",
      Rejected: "bg-destructive text-destructive-foreground",
      Review: "bg-warning text-warning-foreground",
    }[result.decision] || "bg-warning text-warning-foreground";

  const riskColor =
    {
      Low: "text-success",
      Medium: "text-warning",
      High: "text-destructive",
    }[result.risk_category] || "text-muted-foreground";

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="animate-confetti absolute h-2 w-2 rounded-full bg-accent"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Application Result</h1>
            <p className="text-muted-foreground">Application ID: {id}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-2xl shadow-xl md:col-span-2">
              <CardHeader className="pb-4 text-center">
                <div className="mb-4 flex justify-center">{decisionIcon}</div>
                <Badge className={`${decisionBadge} mb-4 px-4 py-1 text-lg`}>
                  {result.decision}
                </Badge>
                <CardTitle className="text-4xl font-bold">
                  {result.final_score}{" "}
                  <span className="text-2xl text-muted-foreground">/ 300</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Final Risk Score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk Category:</span>
                    <span className={`font-semibold ${riskColor}`}>
                      {result.risk_category}
                    </span>
                  </div>
                  <Progress value={(result.final_score / 300) * 100} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>High Risk</span>
                    <span>Low Risk</span>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-primary bg-muted p-4">
                  <p className="text-sm italic">{result.explanation}</p>
                </div>

                <div className="flex gap-4">
                  {result.decision === "Approved" && (
                    <Button
                      onClick={() => navigate(`/installment/${id}`)}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90"
                    >
                      View Installment Plan
                    </Button>
                  )}
                  {result.decision === "Review" && (
                    <Button variant="outline" className="flex-1 h-12">
                      Request More Info
                    </Button>
                  )}
                  <Button variant="outline" className="h-12">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle>Scoring Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScoreBlock
                  title="AI Risk Score"
                  value={result.ai_score}
                  max={100}
                />
                <ScoreBlock
                  title="Manual Score"
                  value={result.manual_score}
                  max={200}
                />

                <div className="space-y-3 border-t pt-4">
                  <DetailRow
                    label="Loan-to-Income"
                    score={result.details.loan_to_income.score}
                    hint={`Ratio: ${result.details.loan_to_income.ratio}`}
                  />
                  <DetailRow
                    label="Existing Debt"
                    score={result.details.existing_debt.score}
                    hint={result.details.existing_debt.amount}
                  />
                  <DetailRow
                    label="Age Score"
                    score={result.details.age_score.score}
                    hint={`Age: ${result.details.age_score.age}`}
                  />
                  <DetailRow
                    label="Loyalty Score"
                    score={result.details.loyalty_score.score}
                    hint={result.details.loyalty_score.status}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const ScoreBlock = ({ title, value, max }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="font-medium">{title}</span>
      <span className="font-bold">{value}</span>
    </div>
    <Progress value={(value / max) * 100} className="h-2" />
    <p className="text-xs text-muted-foreground">Max: {max}</p>
  </div>
);

const DetailRow = ({ label, score, hint }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm">
      <span>{label}</span>
      <span className="font-semibold">{score}</span>
    </div>
    <p className="text-xs text-muted-foreground">{hint}</p>
  </div>
);

