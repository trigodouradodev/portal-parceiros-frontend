import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/auth/auth-context";

export function PublicRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
