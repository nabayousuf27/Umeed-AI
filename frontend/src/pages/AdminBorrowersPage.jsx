import { useEffect } from "react";
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

const borrowers = [
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

const AdminBorrowersPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Showing latest borrower applications");
  }, []);

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBorrowersPage;

