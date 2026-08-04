import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/auth/auth-context";
import { testUser } from "@/test/render";

function renderAuthRoutes(
  auth: Partial<AuthContextType>,
  initialPath: string,
  kind: "protected" | "public",
) {
  const value: AuthContextType = {
    user: testUser,
    accessToken: "token",
    refreshToken: "refresh",
    loading: false,
    authenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
    ...auth,
  };

  const Guard = kind === "protected" ? ProtectedRoute : PublicRoute;

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Guard />}>
            <Route
              path={kind === "protected" ? "/" : "/login"}
              element={
                <div>
                  {kind === "protected" ? "Área privada" : "Página pública"}
                </div>
              }
            />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("shows spinner while loading", () => {
    renderAuthRoutes({ loading: true, authenticated: false }, "/", "protected");
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    renderAuthRoutes(
      { authenticated: false, user: null, accessToken: null },
      "/",
      "protected",
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders outlet when authenticated", () => {
    renderAuthRoutes({ authenticated: true }, "/", "protected");
    expect(screen.getByText("Área privada")).toBeInTheDocument();
  });
});

describe("PublicRoute", () => {
  it("redirects authenticated users to home", () => {
    renderAuthRoutes({ authenticated: true }, "/login", "public");
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders outlet when unauthenticated", () => {
    renderAuthRoutes(
      { authenticated: false, user: null, accessToken: null },
      "/login",
      "public",
    );
    expect(screen.getByText("Página pública")).toBeInTheDocument();
  });
});
