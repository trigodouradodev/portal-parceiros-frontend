import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/login/LoginPage";
import { CarteiraPage } from "@/features/carteira/CarteiraPage";
import { VisaoPage } from "@/features/visao/VisaoPage";
import { PerfilPage } from "@/features/perfil/PerfilPage";

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
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "carteira", element: <CarteiraPage /> },
          { path: "visao", element: <VisaoPage /> },
          { path: "perfil", element: <PerfilPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
