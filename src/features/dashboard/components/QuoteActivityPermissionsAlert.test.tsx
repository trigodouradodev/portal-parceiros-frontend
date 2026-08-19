import { screen } from "@testing-library/react";
import { QuoteActivityPermissionsAlert } from "@/features/dashboard/components/QuoteActivityPermissionsAlert";
import { renderWithProviders } from "@/test/render";

describe("QuoteActivityPermissionsAlert", () => {
  it("shows both proposal actions as allowed", () => {
    renderWithProviders(
      <QuoteActivityPermissionsAlert canSimulateQuote canCreateQuote />,
    );

    expect(screen.getByText("Simular proposta:")).toBeInTheDocument();
    expect(screen.getByText("Criar proposta:")).toBeInTheDocument();
    expect(screen.getAllByText("Liberado")).toHaveLength(2);
  });

  it("identifies each blocked proposal action", () => {
    renderWithProviders(
      <QuoteActivityPermissionsAlert canSimulateQuote={false} canCreateQuote />,
    );

    expect(screen.getByText("Bloqueado")).toBeInTheDocument();
    expect(screen.getByText("Liberado")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Execute ou reagende as ações pendentes para liberar as opções.",
      ),
    ).toBeInTheDocument();
  });
});
