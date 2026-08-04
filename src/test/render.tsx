import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/auth/auth-context";
import type { UserProfile } from "@/services/auth/types";

export const testUser: UserProfile = {
  id: "user-1",
  email: "ana@test.com",
  full_name: "Ana Parceira",
  phone_number: null,
  role: "CONSULTANT",
  permissions: [],
};

const defaultAuth: AuthContextType = {
  user: testUser,
  accessToken: "access-token",
  refreshToken: "refresh-token",
  loading: false,
  authenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
};

export function renderWithProviders(
  ui: ReactElement,
  options?: {
    auth?: Partial<AuthContextType>;
    route?: string;
    withRouter?: boolean;
  } & Omit<RenderOptions, "wrapper">,
) {
  const {
    auth,
    route = "/",
    withRouter = false,
    ...renderOptions
  } = options ?? {};
  const value: AuthContextType = { ...defaultAuth, ...auth };

  function Wrapper({ children }: { children: ReactNode }) {
    const content = (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );

    if (!withRouter) return content;

    return <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
