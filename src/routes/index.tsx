import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { CarteiraPage } from "@/features/carteira";
import { ContractListPage } from "@/features/carteira/ContractListPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/login/LoginPage";
import { ContractDetailPage } from "@/features/contract-detail";
import { OriginacaoPage } from "@/features/originacao";
import { PerformancePage } from "@/features/performance";
import { ProfilePage } from "@/features/profile";
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
      {
        path: "/register/preventive",
        element: <RegisterPreventiveActionPage />,
      },
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "/carteira", element: <CarteiraPage /> },
          { path: "/carteira/contratos", element: <ContractListPage /> },
          { path: "/originacao", element: <OriginacaoPage /> },
          { path: "/performance", element: <PerformancePage /> },
          { path: "/profile", element: <ProfilePage /> },
          {
            path: "/contracts/:contractId",
            element: <ContractDetailPage />,
          },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
