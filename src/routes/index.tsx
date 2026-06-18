import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/login/LoginPage";
import { RegisterCobrActionPage } from "@/features/register-cobr-action";
import { RegisterPrevActionPage } from "@/features/register-prev-action";
import { RegisterContactActionPage } from "@/features/register-contact-action";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/register/cobr", element: <RegisterCobrActionPage /> },
      { path: "/register/prev", element: <RegisterPrevActionPage /> },
      { path: "/register/contact", element: <RegisterContactActionPage /> },
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
