import { AxiosError } from "axios";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "@/features/login/LoginPage";
import { renderWithProviders } from "@/test/render";

function renderLogin(login = vi.fn()) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Home</div>} />
    </Routes>,
    {
      withRouter: true,
      route: "/login",
      auth: {
        authenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        login,
      },
    },
  );
}

function emailInput() {
  return screen.getByPlaceholderText("seu@email.com");
}

function passwordInput() {
  return screen.getByPlaceholderText("••••••••");
}

describe("LoginPage", () => {
  it("renders welcome copy and disabled submit initially", () => {
    renderLogin();

    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByText("Portal do Parceiro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
  });

  it("shows validation messages for invalid email", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(emailInput(), "invalido");
    await user.type(passwordInput(), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Informe um e-mail válido"),
    ).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderLogin();

    expect(passwordInput()).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("Mostrar senha"));
    expect(passwordInput()).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Ocultar senha")).toBeInTheDocument();
  });

  it("navigates home on successful login", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    renderLogin(login);

    await user.type(emailInput(), "ana@test.com");
    await user.type(passwordInput(), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "ana@test.com",
        password: "senha123",
      });
    });
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });

  it("shows credentials error on 401", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(
      new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: { headers: {} as never },
      }),
    );
    renderLogin(login);

    await user.type(emailInput(), "ana@test.com");
    await user.type(passwordInput(), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou senha incorretos. Tente novamente.",
    );
  });

  it("shows permission error on 403", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(
      new AxiosError("Forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 403,
        data: {},
        statusText: "Forbidden",
        headers: {},
        config: { headers: {} as never },
      }),
    );
    renderLogin(login);

    await user.type(emailInput(), "ana@test.com");
    await user.type(passwordInput(), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você não tem permissão para acessar o Portal.",
    );
  });

  it("shows offline error when there is no response", async () => {
    const user = userEvent.setup();
    const login = vi
      .fn()
      .mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));
    renderLogin(login);

    await user.type(emailInput(), "ana@test.com");
    await user.type(passwordInput(), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sem conexão. Verifique sua internet e tente novamente.",
    );
  });

  it("mostra 'Acesso bloqueado' quando o 403 traz o código de restrição de parceiro", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(
      new AxiosError("Forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 403,
        data: {
          statusCode: 403,
          code: "PARTNER_ACCESS_RESTRICTED",
          message: "Acesso bloqueado. Fale com seu gerente.",
        },
        statusText: "Forbidden",
        headers: {},
        config: { headers: {} as never },
      }),
    );
    renderLogin(login);

    await user.type(emailInput(), "ana@test.com");
    await user.type(passwordInput(), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Acesso bloqueado. Fale com seu gerente.",
    );
    expect(
      screen.queryByText("Você não tem permissão para acessar o Portal."),
    ).not.toBeInTheDocument();
  });

  describe("sessão encerrada por restrição de acesso", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function stubSessionStorage(reason: string | null) {
      const data = new Map<string, string>();
      if (reason) data.set("auth_logout_reason", reason);
      vi.stubGlobal("sessionStorage", {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
      });
      return data;
    }

    it("explica o motivo ao chegar no login e some quando o usuário começa a digitar", async () => {
      const user = userEvent.setup();
      const stored = stubSessionStorage("PARTNER_ACCESS_RESTRICTED");
      renderLogin();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Acesso bloqueado. Fale com seu gerente.",
      );

      await user.type(emailInput(), "a");

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
      expect(stored.has("auth_logout_reason")).toBe(false);
    });

    it("sem motivo registrado, o login abre sem aviso", () => {
      stubSessionStorage(null);
      renderLogin();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
