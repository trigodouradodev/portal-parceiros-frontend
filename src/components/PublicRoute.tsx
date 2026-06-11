import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth/auth-context";

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-[hsl(var(--foreground))]">Carregando...</div>
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
