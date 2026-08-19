import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { QuoteActivityPermissionsAlert } from "@/features/dashboard/components/QuoteActivityPermissionsAlert";
import { renderWithProviders } from "@/test/render";

describe("QuoteActivityPermissionsAlert", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_BACKOFFICE_URL", "https://backoffice.example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows links to both Backoffice proposal actions when allowed", () => {
    renderWithProviders(
      <QuoteActivityPermissionsAlert canSimulateQuote canCreateQuote />,
    );

    expect(
      screen.getByRole("link", { name: "Simular proposta" }),
    ).toHaveAttribute("href", "https://backoffice.example.com/quotes");
    expect(
      screen.getByRole("link", { name: "Simular proposta" }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("link", { name: "Criar proposta" }),
    ).toHaveAttribute(
      "href",
      "https://backoffice.example.com/quotes/create/register",
    );
    expect(
      screen.getByRole("link", { name: "Criar proposta" }),
    ).toHaveAttribute("target", "_blank");
  });

  it("explains in a modal how to unblock each proposal action", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QuoteActivityPermissionsAlert canSimulateQuote={false} canCreateQuote />,
    );

    const simulateButton = screen.getByRole("button", {
      name: "Simular proposta",
    });
    expect(simulateButton).toBeDisabled();
    expect(
      screen.getByRole("link", { name: "Criar proposta" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Entenda como liberar propostas",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Como liberar os acessos a propostas",
    });
    expect(dialog).toHaveTextContent("Simular proposta");
    expect(dialog).toHaveTextContent("Criar proposta");
    expect(dialog).toHaveTextContent("Recém vencido — D+1–2");
    expect(dialog).toHaveTextContent(
      "Não há ações pendentes que impeçam este acesso.",
    );
  });
});
