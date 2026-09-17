import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PermissionRoute } from "@/components/PermissionRoute";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/auth/auth-context";
import { testUser } from "@/test/render";

function renderRoute(permissions: string[]) {
  const auth: AuthContextType = {
    user: { ...testUser, permissions },
    accessToken: "token",
    refreshToken: "refresh",
    loading: false,
    authenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/originacao"]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/originacao"
            element={
              <PermissionRoute permission="QUOTE_NEW_ORIGINATION_FLOW">
                <div>Nova originação</div>
              </PermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("PermissionRoute", () => {
  it("renders the route with the explicit permission", () => {
    renderRoute(["QUOTE_NEW_ORIGINATION_FLOW"]);

    expect(screen.getByText("Nova originação")).toBeInTheDocument();
  });

  it("redirects to home without the explicit permission", () => {
    renderRoute(["ROLE_ADMIN"]);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Nova originação")).not.toBeInTheDocument();
  });
});
