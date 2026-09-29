import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SimulacaoListItem } from "@/features/originacao/components/SimulacaoListItem";
import type { SimulationSnapshot } from "@/features/originacao/types";

function snapshot(
  overrides: Partial<SimulationSnapshot> = {},
): SimulationSnapshot {
  return {
    id: "sim-1",
    createdAt: "2026-09-28T12:00:00.000Z",
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
    firstInstallmentDate: "2026-10-05",
    installmentAmount: 673.58,
    ...overrides,
  };
}

describe("SimulacaoListItem", () => {
  it("mostra a parcela financiada com seguro quando a simulação cotou seguro", () => {
    render(
      <SimulacaoListItem
        item={snapshot({ installmentAmountWithInsurance: 740.94 })}
        canCreateQuote
        startingId={null}
        onEdit={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    expect(
      screen.getByText("10x de R$ 740,94 · vencimento dia 05"),
    ).toBeInTheDocument();
  });

  it("mostra a parcela sem seguro quando não cotou seguro", () => {
    render(
      <SimulacaoListItem
        item={snapshot()}
        canCreateQuote
        startingId={null}
        onEdit={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    expect(
      screen.getByText("10x de R$ 673,58 · vencimento dia 05"),
    ).toBeInTheDocument();
  });
});
