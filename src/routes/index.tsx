import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/login/LoginPage";
import { RegisterChargeActionPage } from "@/features/register-action/charge";
import { RegisterPreventiveActionPage } from "@/features/register-action/preventive";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/register/charge", element: <RegisterChargeActionPage /> },
      { path: "/register/preventive", element: <RegisterPreventiveActionPage /> },
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
