import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";

/**
 * SummaryCards Component
 * Displays key performance indicators in a responsive grid
 */
export const SummaryCards = ({ summary, analytics }) => {
  const cards = [
    {
      icon: <Users className="h-4 w-4" />,
      label: "Total Applications",
      value: summary.total_applications,
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      label: "Approved",
      value: summary.approved,
      valueClass: "text-success",
    },
    {
      icon: <XCircle className="h-4 w-4 text-destructive" />,
      label: "Rejected",
      value: summary.rejected,
      valueClass: "text-destructive",
    },
    {
      icon: <Clock className="h-4 w-4 text-warning" />,
      label: "Pending Review",
      value: summary.pending,
      valueClass: "text-warning",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Avg Risk Score",
      value: summary.avg_risk_score,
    },
    {
      icon: <Users className="h-4 w-4 text-primary" />,
      label: "Total Clients",
      value: analytics?.clients?.total_clients || 0,
    },
    {
      icon: <FileText className="h-4 w-4 text-blue-600" />,
      label: "Total Loans",
      value: analytics?.loans?.total_loans || 0,
    },
    {
      icon: <Activity className="h-4 w-4 text-green-600" />,
      label: "Active Loans",
      value: analytics?.loans?.active_loans || 0,
      valueClass: "text-green-600",
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      label: "Completed Loans",
      value: analytics?.loans?.completed_loans || 0,
      valueClass: "text-emerald-600",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              {card.icon}
              {card.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.valueClass || ""}`}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


