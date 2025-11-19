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
  // Get values from analytics overview if available, otherwise from summary
  const totalClients = analytics?.overview?.total_clients || 0;
  const totalLoans = analytics?.overview?.total_loans || summary?.total_applications || 0;
  const activeLoans = analytics?.overview?.active_loans || 0;
  const completedLoans = summary?.approved || 0;
  
  const cards = [
    {
      icon: <Users className="h-4 w-4" />,
      label: "Total Applications",
      value: summary?.total_applications || 0,
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      label: "Approved",
      value: summary?.approved || 0,
      valueClass: "text-success",
    },
    {
      icon: <XCircle className="h-4 w-4 text-destructive" />,
      label: "Rejected",
      value: summary?.rejected || 0,
      valueClass: "text-destructive",
    },
    {
      icon: <Clock className="h-4 w-4 text-warning" />,
      label: "Pending Review",
      value: summary?.pending || 0,
      valueClass: "text-warning",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Avg Risk Score",
      value: summary?.avg_risk_score ? Math.round(summary.avg_risk_score) : 0,
    },
    {
      icon: <Users className="h-4 w-4 text-primary" />,
      label: "Total Clients",
      value: totalClients,
    },
    {
      icon: <FileText className="h-4 w-4 text-blue-600" />,
      label: "Total Loans",
      value: totalLoans,
    },
    {
      icon: <Activity className="h-4 w-4 text-green-600" />,
      label: "Active Loans",
      value: activeLoans,
      valueClass: "text-green-600",
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      label: "Completed Loans",
      value: completedLoans,
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


