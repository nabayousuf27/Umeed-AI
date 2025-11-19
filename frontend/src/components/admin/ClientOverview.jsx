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

  const stats = [
    {
      label: "Total Clients",
      value: overview.total_clients,
      description: "Registered borrowers",
    },
    {
      label: "Low Risk",
      value: `${overview.low_risk_percentage}%`,
      description: `${Math.round((overview.low_risk_percentage / 100) * overview.total_clients)} clients`,
      badge: "bg-success text-success-foreground",
    },
    {
      label: "Medium Risk",
      value: `${overview.medium_risk_percentage}%`,
      description: `${Math.round((overview.medium_risk_percentage / 100) * overview.total_clients)} clients`,
      badge: "bg-warning text-warning-foreground",
    },
    {
      label: "High Risk",
      value: `${overview.high_risk_percentage}%`,
      description: `${Math.round((overview.high_risk_percentage / 100) * overview.total_clients)} clients`,
      badge: "bg-destructive text-destructive-foreground",
    },
    {
      label: "Average Loan Size",
      value: `PKR ${overview.average_loan_size.toLocaleString()}`,
      description: "Per loan disbursement",
    },
  ];

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

