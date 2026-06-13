import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth/auth-context";

export function PublicRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Carregando...</p>
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
