import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
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
import { Button } from "../components/ui/button";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useAuth } from "../context/AuthContext";
import { getAllLoans } from "../services/api";

const AdminBorrowersPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role !== "admin") {
      toast.error("Admin access required");
      navigate("/admin-auth");
      return;
    }

    const fetchBorrowers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAllLoans();
        const loans = response.data || [];

        // Transform loans data to borrowers format
        const borrowersData = loans.map((loan) => ({
          id: loan.id,
          name: loan.borrower?.full_name || "Unknown Borrower",
          cnic: loan.borrower?.cnic || "N/A",
          loan_amount: loan.loan_amount || 0,
          final_score: loan.final_score || loan.ai_score || 0,
          risk_category: loan.risk_category || "Medium",
          status: loan.status === "pending" ? "Pending" :
                  loan.status === "active" ? "Approved" :
                  loan.status === "completed" ? "Approved" : "Rejected",
        }));

        setBorrowers(borrowersData);
      } catch (error) {
        console.error("Error fetching borrowers:", error);
        setError(error.response?.data?.detail || "Failed to load borrowers");
        toast.error("Failed to load borrower applications");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowers();
  }, [navigate, role]);

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Borrower Profiles</h1>
          <p className="text-muted-foreground">
            Review active applications and drill into loan files.
          </p>
        </div>

        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Click “View” to open the full profile.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center">
                <LoadingSpinner className="mb-2" />
                <p className="text-sm text-muted-foreground">Loading borrowers...</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : borrowers.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No borrowers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>CNIC</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowers.map((borrower) => (
                      <TableRow key={borrower.id}>
                        <TableCell className="font-medium">{borrower.id}</TableCell>
                        <TableCell>{borrower.name}</TableCell>
                        <TableCell>{borrower.cnic}</TableCell>
                        <TableCell className="font-semibold">
                          PKR {borrower.loan_amount.toLocaleString()}
                        </TableCell>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBorrowersPage;

