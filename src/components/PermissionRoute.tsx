import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/auth-context";
import { hasPermission } from "@/lib/permissions";

interface PermissionRouteProps {
  permission: string;
  children: ReactNode;
}

export function PermissionRoute({
  permission,
  children,
}: PermissionRouteProps) {
  const { user } = useAuth();

  if (!hasPermission(user?.permissions, permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
