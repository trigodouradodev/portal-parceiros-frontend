import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SimulationResultCard } from "@/features/originacao/components/simulacao/SimulationResultCard";
import type { SimulationSnapshot } from "@/features/originacao/types";

function snapshot(
  overrides: Partial<SimulationSnapshot> = {},
): SimulationSnapshot {
  return {
    id: "sim-1",
    createdAt: "2026-11-10T12:00:00.000Z",
    status: "available",
    name: "Maria Souza",
    birthDate: "1990-05-20",
    email: "maria@email.com",
    telephone: "11987654321",
    document: "52998224725",
    productId: "product-1",
    productName: "AUREA_ESPECIAL",
    amount: 5000,
    installments: 10,
    firstInstallmentDate: "2026-12-05",
    installmentAmount: 673.58,
    ...overrides,
  };
}

describe("SimulationResultCard — risco de crédito", () => {
  it.each([
    ["low", "Crédito de baixo risco"],
    ["medium", "Crédito de médio risco"],
    ["high", "Crédito de alto risco"],
  ] as const)("mostra a faixa %s com o texto %s", (band, label) => {
    render(
      <SimulationResultCard simulation={snapshot({ creditRiskBand: band })} />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("não mostra indicativo quando a consulta não trouxe faixa", () => {
    render(<SimulationResultCard simulation={snapshot()} />);

    expect(screen.queryByText(/Crédito de .* risco/)).not.toBeInTheDocument();
    expect(screen.getByText("Simulação concluída")).toBeInTheDocument();
  });

  it("não exibe score, mesmo que o backend envie algum campo extra", () => {
    const withExtra = {
      ...snapshot({ creditRiskBand: "medium" }),
      serasaScore: 450,
    } as SimulationSnapshot;
    const { container } = render(
      <SimulationResultCard simulation={withExtra} />,
    );

    expect(container).not.toHaveTextContent("450");
  });
});
