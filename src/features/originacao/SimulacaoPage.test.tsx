import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { SimulacaoPage } from "@/features/originacao/SimulacaoPage";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { useQuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";

vi.mock("@/hooks/useQuoteActivityPermissions", () => ({
  useQuoteActivityPermissions: vi.fn(),
}));

vi.mock("@/features/originacao/components/SimulacaoList", () => ({
  SimulacaoList: ({ onNewSimulation }: { onNewSimulation: () => void }) => (
    <button type="button" onClick={onNewSimulation}>
      Nova simulação
    </button>
  ),
}));

const created: SimulationSnapshot = {
  id: "sim-new",
  createdAt: "2026-09-14T12:00:00.000Z",
  status: "available",
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
  firstInstallmentDate: "2026-10-10",
  installmentAmount: 597.88,
};

const editingProp = vi.hoisted(() => ({ current: null as string | null }));

vi.mock("@/features/originacao/components/SimulacaoForm", () => ({
  SimulacaoForm: ({
    editing,
    onStartProposal,
  }: {
    editing: SimulationSnapshot | null;
    onStartProposal: (snapshot: SimulationSnapshot) => void | Promise<void>;
  }) => {
    editingProp.current = editing?.id ?? null;
    return (
      <button type="button" onClick={() => onStartProposal(created)}>
        Iniciar proposta
      </button>
    );
  },
}));

const permissions = vi.mocked(useQuoteActivityPermissions);

function originacaoValue(
  overrides: Partial<OriginacaoContextValue> = {},
): OriginacaoContextValue {
  return {
    activeTab: "simulation",
    setActiveTab: vi.fn(),
    eligibilityPrefill: null,
    setEligibilityPrefill: vi.fn(),
    clearEligibilityPrefill: vi.fn(),
    simulations: [],
    simulationsLoading: false,
    simulationsError: false,
    refetchSimulations: vi.fn(),
    proposals: [],
    openProposalId: null,
    openingProposalId: null,
    startProposal: vi.fn().mockResolvedValue(true),
    openProposal: vi.fn(),
    closeProposal: vi.fn(),
    updateProposal: vi.fn(),
    ...overrides,
  };
}

function renderPage(value: OriginacaoContextValue) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <OriginacaoContext.Provider value={value}>
        {children}
      </OriginacaoContext.Provider>
    );
  }
  return render(<SimulacaoPage />, { wrapper: Wrapper });
}

describe("SimulacaoPage", () => {
  beforeEach(() => {
    editingProp.current = null;
    permissions.mockReturnValue({
      data: { canCreateQuote: true, canSimulateQuote: true },
      isPending: false,
    } as ReturnType<typeof useQuoteActivityPermissions>);
  });

  it("keeps the created simulation in edit mode when starting a proposal fails", async () => {
    const user = userEvent.setup();
    const startProposal = vi.fn().mockResolvedValue(false);
    renderPage(originacaoValue({ startProposal }));

    await user.click(screen.getByRole("button", { name: "Nova simulação" }));
    expect(editingProp.current).toBeNull();

    await user.click(screen.getByRole("button", { name: "Iniciar proposta" }));

    await waitFor(() => {
      expect(startProposal).toHaveBeenCalledWith(created);
    });
    expect(editingProp.current).toBe(created.id);
  });

  it("closes the form after a proposal starts", async () => {
    const user = userEvent.setup();
    const startProposal = vi.fn().mockResolvedValue(true);
    renderPage(originacaoValue({ startProposal }));

    await user.click(screen.getByRole("button", { name: "Nova simulação" }));
    await user.click(screen.getByRole("button", { name: "Iniciar proposta" }));

    await waitFor(() => {
      expect(startProposal).toHaveBeenCalled();
    });
    expect(
      screen.getByRole("button", { name: "Nova simulação" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Iniciar proposta" }),
    ).not.toBeInTheDocument();
  });
});
