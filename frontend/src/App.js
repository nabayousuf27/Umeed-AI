import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import BorrowerAuthPage from "./pages/BorrowerAuthPage";
import LoanApplicationPage from "./pages/LoanApplicationPage";
import RiskResultPage from "./pages/RiskResultPage";
import InstallmentPlanPage from "./pages/InstallmentPlanPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LoanProfilePage from "./pages/LoanProfilePage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AdminBorrowersPage from "./pages/AdminBorrowersPage";
import MyLoansPage from "./pages/MyLoansPage";
import LoanDetailPage from "./pages/LoanDetailPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/borrower-auth" element={<BorrowerAuthPage />} />
            <Route path="/admin-auth" element={<AdminAuthPage />} />

            <Route element={<ProtectedRoute role="borrower" />}>
              <Route path="/loan-apply" element={<LoanApplicationPage />} />
              <Route path="/my-loans" element={<MyLoansPage />} />
              <Route path="/loan/:id" element={<LoanDetailPage />} />
              <Route path="/risk-result/:id" element={<RiskResultPage />} />
              <Route path="/installment/:id" element={<InstallmentPlanPage />} />
            </Route>

            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/borrowers" element={<AdminBorrowersPage />} />
              <Route path="/admin/loan/:id" element={<LoanProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
