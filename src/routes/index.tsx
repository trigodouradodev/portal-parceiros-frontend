import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { HomePage } from "@/features/home/HomePage";
import LoginPage from "@/features/login/LoginPage";
import { useAuth } from "@/contexts/AuthContext";

// Componente para proteger rotas autenticadas
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-[hsl(var(--foreground))]">Carregando...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
