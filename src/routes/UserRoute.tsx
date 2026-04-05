import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";

const UserRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default UserRoute;