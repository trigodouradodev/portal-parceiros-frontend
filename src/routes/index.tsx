import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { HomePage } from "@/features/home/HomePage";
import { LoginPage } from "@/features/login/LoginPage";
import { CarteiraPage } from "@/features/carteira/CarteiraPage";

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
          { index: true, element: <HomePage /> },
          { path: "carteira", element: <CarteiraPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
