import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import {
  fetchDashboardSummary,
  fetchRecentActivity,
} from "../services/dashboardService";
import { getAllAnalytics } from "../services/adminAnalyticsData";
import { useAuth } from "../context/AuthContext";
import { SummaryCards } from "../components/admin/SummaryCards";
import { RiskDistributionChart } from "../components/admin/RiskDistributionChart";
import { ClientOverview } from "../components/admin/ClientOverview";
import { getAdminDashboard, getAllLoans, getAllClients } from "../services/api";

const fallbackSummary = {
  total_applications: 156,
  approved: 98,
  pending: 32,
  rejected: 26,
  avg_risk_score: 235,
};

const fallbackBorrowers = [
  {
    id: "APP-001",
    name: "Aisha Khan",
    cnic: "42101-1234567-1",
    loan_amount: 20000,
    final_score: 240,
    risk_category: "Low",
    status: "Approved",
  },
  {
    id: "APP-002",
    name: "Hassan Ali",
    cnic: "42101-7654321-9",
    loan_amount: 15000,
    final_score: 180,
    risk_category: "Medium",
    status: "Pending",
  },
  {
    id: "APP-003",
    name: "Fatima Ahmed",
    cnic: "42101-9876543-2",
    loan_amount: 25000,
    final_score: 120,
    risk_category: "High",
    status: "Rejected",
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [summary, setSummary] = useState(fallbackSummary);
  const [borrowers, setBorrowers] = useState(fallbackBorrowers);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      toast.info("Please login as admin");
      navigate("/admin-auth", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard summary and loans
        const [dashboardRes, loansRes] = await Promise.all([
          getAdminDashboard().catch(() => ({ data: null })),
          getAllLoans().catch(() => ({ data: [] })),
        ]);

        // Process dashboard data
        if (dashboardRes.data) {
          const dashboard = dashboardRes.data;
          const summaryData = dashboard.summary || {};
          const riskData = dashboard.risk_distribution || {};
          
          setSummary({
            total_applications: summaryData.total_loans || fallbackSummary.total_applications,
            approved: summaryData.completed_loans || fallbackSummary.approved,
            pending: summaryData.pending_loans || fallbackSummary.pending,
            rejected: summaryData.rejected_loans || fallbackSummary.rejected,
            avg_risk_score: summaryData.avg_risk_score || fallbackSummary.avg_risk_score,
          });

          // Set analytics with risk distribution
          setAnalytics({
            risk: {
              low: riskData.low_risk || 0,
              medium: riskData.medium_risk || 0,
              high: riskData.high_risk || 0,
            },
            overview: {
              total_clients: summaryData.total_clients || 0,
              total_loans: summaryData.total_loans || 0,
              active_loans: summaryData.active_loans || 0,
            },
          });
        } else {
          setSummary(fallbackSummary);
          setAnalytics(getAllAnalytics());
        }

        // Process loans data
        if (loansRes.data && loansRes.data.length > 0) {
          setBorrowers(
            loansRes.data.map((loan, index) => ({
              id: loan.id || `APP-${String(index + 1).padStart(3, "0")}`,
              name: loan.borrower?.full_name || "Borrower",
              cnic: loan.borrower?.cnic || "N/A",
              loan_amount: loan.loan_amount || 0,
              final_score: loan.final_score || loan.ai_score || 0,
              risk_category: loan.risk_category || "Medium",
              status: loan.status === "pending" ? "Pending" :
                      loan.status === "active" ? "Approved" :
                      loan.status === "completed" ? "Approved" : "Rejected",
            }))
          );
        } else {
          setBorrowers(fallbackBorrowers);
        }

        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          "Unable to load live dashboard data. Showing sample applications."
        );
        setSummary(fallbackSummary);
        setBorrowers(fallbackBorrowers);
        setAnalytics(getAllAnalytics());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((borrower) => {
      const matchesSearch =
        borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrower.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        borrower.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        borrower.status.toLowerCase() === statusFilter;

      const matchesRisk =
        riskFilter === "all" ||
        borrower.risk_category.toLowerCase() === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [borrowers, riskFilter, searchTerm, statusFilter]);

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case "Low":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-destructive text-destructive-foreground";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-destructive text-destructive-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Loan Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and review loan applications
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards summary={summary} analytics={analytics} />

        {/* Risk Distribution Chart */}
        {analytics?.risk && (
          <RiskDistributionChart riskData={analytics.risk} />
        )}

        {/* Client Overview */}
        {analytics?.overview && (
          <ClientOverview overview={analytics.overview} />
        )}

        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>
                  Search and filter loan applications
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, CNIC, or application ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="h-11 w-full md:w-40">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-10 text-center">
                  <LoadingSpinner className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Fetching applications...
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>CNIC</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Final Score</TableHead>
                      <TableHead>Risk Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBorrowers.map((borrower) => (
                      <TableRow key={borrower.id}>
                        <TableCell className="font-medium">
                          {borrower.id}
                        </TableCell>
                        <TableCell>{borrower.name}</TableCell>
                        <TableCell>{borrower.cnic}</TableCell>
                        <TableCell className="font-semibold">
                          PKR {borrower.loan_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{borrower.final_score}</TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(borrower.risk_category)}>
                            {borrower.risk_category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(borrower.status)}>
                            {borrower.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/loan/${borrower.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

