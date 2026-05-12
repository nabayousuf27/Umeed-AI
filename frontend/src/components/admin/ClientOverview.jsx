import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

/**
 * ClientOverview Component
 * Displays client statistics and risk breakdown
 */
export const ClientOverview = ({ overview }) => {
  if (!overview) {
    return null;
  }

  // Safely get values with defaults
  const totalClients = overview.total_clients || 0;
  const totalLoans = overview.total_loans || 0;
  const activeLoans = overview.active_loans || 0;
  
  // Calculate risk percentages if we have risk distribution data
  const lowRisk = overview.low_risk || 0;
  const mediumRisk = overview.medium_risk || 0;
  const highRisk = overview.high_risk || 0;
  const totalRisk = lowRisk + mediumRisk + highRisk;
  
  const lowRiskPercentage = totalRisk > 0 ? Math.round((lowRisk / totalRisk) * 100) : 0;
  const mediumRiskPercentage = totalRisk > 0 ? Math.round((mediumRisk / totalRisk) * 100) : 0;
  const highRiskPercentage = totalRisk > 0 ? Math.round((highRisk / totalRisk) * 100) : 0;
  
  // Calculate average loan size safely
  const averageLoanSize = overview.average_loan_size || (totalLoans > 0 ? 0 : 0);
  const averageLoanSizeFormatted = averageLoanSize > 0 
    ? `PKR ${averageLoanSize.toLocaleString()}` 
    : "PKR 0";

  const stats = [
    {
      label: "Total Clients",
      value: totalClients.toLocaleString(),
      description: "Registered borrowers",
    },
    {
      label: "Total Loans",
      value: totalLoans.toLocaleString(),
      description: `${activeLoans} active loans`,
    },
    {
      label: "Low Risk",
      value: `${lowRiskPercentage}%`,
      description: `${lowRisk} clients`,
      badge: "bg-success text-success-foreground",
    },
    {
      label: "Medium Risk",
      value: `${mediumRiskPercentage}%`,
      description: `${mediumRisk} clients`,
      badge: "bg-warning text-warning-foreground",
    },
    {
      label: "High Risk",
      value: `${highRiskPercentage}%`,
      description: `${highRisk} clients`,
      badge: "bg-destructive text-destructive-foreground",
    },
  ];

  // Only add average loan size if we have data
  if (averageLoanSize > 0) {
    stats.push({
      label: "Average Loan Size",
      value: averageLoanSizeFormatted,
      description: "Per loan disbursement",
    });
  }

  return (
    <Card className="mb-8 rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle>Client Overview</CardTitle>
        <CardDescription>
          Key metrics and risk profile summary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                {stat.badge && (
                  <Badge className={stat.badge} variant="secondary">
                    {stat.value}
                  </Badge>
                )}
              </div>
              {!stat.badge && (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


