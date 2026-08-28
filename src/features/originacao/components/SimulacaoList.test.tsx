import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { renderWithProviders } from "@/test/render";

const snapshot: SimulationSnapshot = {
  id: "sim-a",
  createdAt: "2026-08-26T12:00:00.000Z",
  name: "Maria Souza",
  birthDate: "1990-05-20",
  email: "maria@email.com",
  telephone: "11987654321",
  document: "52998224725",
  productId: "11111111-1111-4111-8111-111111111111",
  productName: "CRÉDITO PESSOAL",
  interestRate: 0.0339,
  amount: 5000,
  installments: 10,
  firstInstallmentDate: "2026-09-10",
  installmentAmount: 597.88,
};

describe("SimulacaoList", () => {
  it("offers edit without replacing start proposal", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onStartProposal = vi.fn();

    renderWithProviders(
      <SimulacaoList
        simulations={[snapshot]}
        onNewSimulation={vi.fn()}
        onEdit={onEdit}
        onStartProposal={onStartProposal}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(snapshot);
    expect(onStartProposal).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Iniciar proposta" }),
    ).toBeInTheDocument();
  });
});
