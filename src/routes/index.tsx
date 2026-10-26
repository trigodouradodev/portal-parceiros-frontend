import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionRoute } from "@/components/PermissionRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { CarteiraPage } from "@/features/carteira";
import { ContractListPage } from "@/features/carteira/ContractListPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/login/LoginPage";
import {
  ActivityInstallmentDetailPage,
  NewPortfolioFollowUpPage,
  PortfolioContractDetailPage,
  PortfolioInstallmentDetailPage,
} from "@/features/contract-detail";
import { OriginacaoPage } from "@/features/originacao";
import { PerformancePage } from "@/features/performance";
import { ProfilePage } from "@/features/profile";
import { RegisterChargeActionPage } from "@/features/register-action/charge";
import { RegisterPreventiveActionPage } from "@/features/register-action/preventive";
import {
  ORIGINACAO_MANUAL_URL,
  PRIMEIROS_PASSOS_LEGACY_URL,
  PRIMEIROS_PASSOS_URL,
} from "@/features/ajuda";
import { PORTAL_PERMISSIONS } from "@/lib/permissions";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        // Primeiros Passos (ícone de ajuda do topo nas demais telas). Fora do
        // Layout: abre em outra aba, sem sidebar, e exige login.
        path: PRIMEIROS_PASSOS_URL,
        lazy: async () => {
          const { PrimeirosPassosPage } =
            await import("@/features/ajuda/PrimeirosPassosPage");
          return { Component: PrimeirosPassosPage };
        },
      },
      {
        // Endereço antigo (arquivo estático público, já divulgado a parceiros):
        // mantém o link funcionando, agora atrás do login.
        path: PRIMEIROS_PASSOS_LEGACY_URL,
        element: <Navigate to={PRIMEIROS_PASSOS_URL} replace />,
      },
      {
        // Manual de Originação (ícone de ajuda do topo na tela de Originação).
        // Fora do Layout: abre em outra aba, sem sidebar. Carregado sob demanda
        // para não pesar o bundle principal com as 39 imagens do manual.
        path: ORIGINACAO_MANUAL_URL,
        lazy: async () => {
          const { ManualOriginacaoPage } =
            await import("@/features/ajuda/ManualOriginacaoPage");
          return { Component: ManualOriginacaoPage };
        },
      },
      { path: "/register/charge", element: <RegisterChargeActionPage /> },
      {
        path: "/register/preventive",
        element: <RegisterPreventiveActionPage />,
      },
      {
        path: "/carteira/contratos/:contractId/parcelas/:installmentNumber/follow-ups/novo",
        element: <NewPortfolioFollowUpPage />,
      },
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "/carteira", element: <CarteiraPage /> },
          { path: "/carteira/contratos", element: <ContractListPage /> },
          {
            path: "/carteira/contratos/:contractId",
            element: <PortfolioContractDetailPage />,
          },
          {
            path: "/carteira/contratos/:contractId/parcelas/:installmentNumber",
            element: <PortfolioInstallmentDetailPage />,
          },
          {
            path: "/activities/installments/:installmentId",
            element: <ActivityInstallmentDetailPage />,
          },
          {
            path: "/originacao",
            element: (
              <PermissionRoute
                permission={PORTAL_PERMISSIONS.QUOTE_NEW_ORIGINATION_FLOW}
              >
                <OriginacaoPage />
              </PermissionRoute>
            ),
          },
          {
            path: "/performance",
            element: (
              <PermissionRoute permission={PORTAL_PERMISSIONS.PERFORMANCE_VIEW}>
                <PerformancePage />
              </PermissionRoute>
            ),
          },
          { path: "/profile", element: <ProfilePage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
