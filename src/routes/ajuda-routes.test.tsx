import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/auth/auth-context";
import { testUser } from "@/test/render";

vi.mock("@/features/login/LoginPage", () => ({
  LoginPage: () => <div>Tela de login</div>,
}));

function renderAt(path: string, authenticated: boolean) {
  const auth: AuthContextType = {
    user: authenticated ? testUser : null,
    accessToken: authenticated ? "token" : null,
    refreshToken: authenticated ? "refresh" : null,
    loading: false,
    authenticated,
    login: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  };
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: [path],
  });

  render(
    <AuthContext.Provider value={auth}>
      <RouterProvider router={memoryRouter} />
    </AuthContext.Provider>,
  );

  return memoryRouter;
}

describe("manuais de ajuda exigem login", () => {
  it.each([
    "/ajuda/originacao",
    "/ajuda/primeiros-passos",
    "/ajuda/primeiros-passos.html",
  ])("sem sessão, %s leva para o login", async (path) => {
    const memoryRouter = renderAt(path, false);

    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/login");
    expect(screen.queryByTitle("Primeiros Passos no Portal")).toBeNull();
    expect(screen.queryByText("Manual de Originação")).toBeNull();
  });

  it("logado, abre o Manual de Originação", async () => {
    renderAt("/ajuda/originacao", true);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Manual de Originação",
      }),
    ).toBeInTheDocument();
  });

  it("logado, abre o Primeiros Passos", async () => {
    renderAt("/ajuda/primeiros-passos", true);

    expect(
      await screen.findByTitle("Primeiros Passos no Portal"),
    ).toBeInTheDocument();
  });

  it("logado, o endereço antigo .html redireciona para o Primeiros Passos", async () => {
    const memoryRouter = renderAt("/ajuda/primeiros-passos.html", true);

    expect(
      await screen.findByTitle("Primeiros Passos no Portal"),
    ).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe(
      "/ajuda/primeiros-passos",
    );
  });
});
