import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NotFound } from "@/components/NotFound";
import { HomePage } from "@/features/home/HomePage";
import LoginPage from "@/features/login/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
