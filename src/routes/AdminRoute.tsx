import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";

const AdminRoute = () => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;