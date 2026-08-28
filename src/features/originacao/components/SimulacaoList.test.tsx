import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { SimulacaoList } from "@/features/originacao/components/SimulacaoList";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { originationService } from "@/services/origination/origination.service";
import { renderWithProviders } from "@/test/render";

vi.mock("@/services/origination/origination.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/origination/origination.service")
  >("@/services/origination/origination.service");
  return {
    ...actual,
    originationService: {
      ...actual.originationService,
      listSimulations: vi.fn(),
    },
  };
});

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

const listSimulations = vi.mocked(originationService.listSimulations);

function renderList(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithProviders(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("SimulacaoList", () => {
  beforeEach(() => {
    listSimulations.mockReset();
  });

  it("keeps Nova simulação on the true empty state and hides search", async () => {
    listSimulations.mockResolvedValue([]);

    renderList(
      <SimulacaoList
        hasUnfilteredSimulations={false}
        onNewSimulation={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    expect(
      await screen.findByText("Nenhuma simulação ainda"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nova simulação" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Buscar por nome ou CPF"),
    ).not.toBeInTheDocument();
  });

  it("shows filter empty state without hiding Nova simulação", async () => {
    listSimulations.mockResolvedValue([]);

    renderList(
      <SimulacaoList
        hasUnfilteredSimulations
        onNewSimulation={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await userEvent.type(
      await screen.findByPlaceholderText("Buscar por nome ou CPF"),
      "zzz",
    );

    expect(
      await screen.findByText("Nenhuma simulação encontrada"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nova simulação" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhuma simulação ainda"),
    ).not.toBeInTheDocument();
  });

  it("requests the API with name after debounce", async () => {
    listSimulations.mockResolvedValue([snapshot]);

    renderList(
      <SimulacaoList
        hasUnfilteredSimulations
        onNewSimulation={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await screen.findByText("Maria Souza");
    await userEvent.type(
      screen.getByPlaceholderText("Buscar por nome ou CPF"),
      "maria",
    );

    await waitFor(() => {
      expect(listSimulations).toHaveBeenCalledWith({ name: "maria" });
    });
  });

  it("requests the API with digits-only CPF after debounce", async () => {
    listSimulations.mockResolvedValue([snapshot]);

    renderList(
      <SimulacaoList
        hasUnfilteredSimulations
        onNewSimulation={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await screen.findByText("Maria Souza");
    await userEvent.type(
      screen.getByPlaceholderText("Buscar por nome ou CPF"),
      "529.982.247-25",
    );

    await waitFor(() => {
      expect(listSimulations).toHaveBeenCalledWith({
        document: "52998224725",
      });
    });
  });
});
