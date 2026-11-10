import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("não mostra o rótulo 'Risco' ao lado do badge", () => {
    render(
      <SimulationResultCard
        simulation={snapshot({ creditRiskBand: "medium" })}
      />,
    );

    expect(screen.queryByText("Risco")).not.toBeInTheDocument();
  });

  it("não mostra o ícone de informação sem faixa", () => {
    render(<SimulationResultCard simulation={snapshot()} />);

    expect(
      screen.queryByRole("button", { name: "Entenda o risco de crédito" }),
    ).not.toBeInTheDocument();
  });

  it("abre a explicação do critério pelo ícone de informação, sem mostrar score", async () => {
    const user = userEvent.setup();
    render(
      <SimulationResultCard
        simulation={
          {
            ...snapshot({ creditRiskBand: "medium" }),
            serasaScore: 450,
          } as SimulationSnapshot
        }
      />,
    );

    expect(
      screen.queryByText("Como o risco de crédito é definido"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Entenda o risco de crédito" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Como o risco de crédito é definido",
    });
    expect(
      within(dialog).getByText(/consultamos o Serasa/),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Crédito de baixo risco"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Crédito de médio risco"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Crédito de alto risco"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/O score em si não é mostrado/),
    ).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent(/\d/);
  });

  it("fecha a explicação", async () => {
    const user = userEvent.setup();
    render(
      <SimulationResultCard
        simulation={snapshot({ creditRiskBand: "high" })}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Entenda o risco de crédito" }),
    );
    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
