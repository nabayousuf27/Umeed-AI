import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ role }) => {
  const location = useLocation();
  const { isLoggedIn, role: userRole } = useAuth();

  if (!isLoggedIn) {
    const fallback = role === "admin" ? "/admin-auth" : "/borrower-auth";
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    const safeRoute = userRole === "admin" ? "/admin-dashboard" : "/";
    return <Navigate to={safeRoute} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


