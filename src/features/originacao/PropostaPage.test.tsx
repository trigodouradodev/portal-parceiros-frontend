import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { ToastContext } from "@/contexts/toast/toast-context";
import { PropostaPage } from "@/features/originacao/PropostaPage";
import {
  createProposalFromSimulation,
  FINANCIAL_STEP_INDEX,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import type { QuoteDraftSimulationSnapshot } from "@/services/quotes/quotes.types";
import { renderWithProviders } from "@/test/render";

// jsdom não implementa `Element.scrollTo`.
vi.mock(
  "@/features/originacao/utils/scroll-to-first-error",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/originacao/utils/scroll-to-first-error")
    >()),
    scrollTaskToTop: vi.fn(),
    scrollToField: vi.fn(),
  }),
);

vi.mock("@/features/originacao/hooks/useQuoteDocumentation", () => ({
  useQuoteAttachments: () => ({ data: undefined }),
  useCompleteQuoteDocumentation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSubmitQuoteDraft: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Hooks de passos que não participam deste teste: só precisam existir.
const idleMutation = () => ({ mutateAsync: vi.fn(), isPending: false });
vi.mock("@/features/originacao/hooks/useSaveQuoteRegistration", () => ({
  useSaveQuoteRegistration: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useSaveQuoteAddress", () => ({
  useSaveQuoteAddress: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useSaveQuoteGuarantor", () => ({
  useSaveQuoteGuarantor: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useSaveQuoteIncome", () => ({
  useSaveQuoteIncome: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useSaveQuoteFinancial", () => ({
  useSaveQuoteFinancial: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useSaveQuotePartnerOpinion", () => ({
  useSaveQuotePartnerOpinion: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useApplyRenewalPrefill", () => ({
  useApplyRenewalPrefill: () => idleMutation(),
}));
vi.mock("@/features/originacao/hooks/useEmailDeliverability", () => ({
  useEmailDeliverability: () => ({ status: "idle" }),
}));
vi.mock("@/features/originacao/hooks/useGuarantorPartyAutoFill", () => ({
  useGuarantorPartyAutoFill: () => ({}),
}));
vi.mock(
  "@/features/originacao/components/proposta/PartnerOpinionSection",
  () => ({
    PartnerOpinionSection: () => <div>Parecer do parceiro</div>,
  }),
);
vi.mock("@/features/originacao/components/proposta/FinancialSection", () => ({
  FinancialSection: () => <div>Seção financeira</div>,
}));
vi.mock("@/features/originacao/components/proposta/DocumentsSection", () => ({
  DocumentsSection: () => <div>Seção de documentos</div>,
}));

// A tela de edição tem testes próprios: aqui só interessa a integração.
const updateResult: QuoteDraftSimulationSnapshot = {
  id: "quote-1",
  simulationId: "sim-1",
  productId: "produto-novo",
  productName: "PRODUTO NOVO",
  interestRate: 0.0339,
  financeAmount: 8000,
  installmentNumbers: 12,
  firstInstallmentDate: "2026-12-15",
  installmentAmount: 780.5,
  installmentAmountWithInsurance: 805.7,
  insurancePremium: 240,
  totalAmountOwed: 9366,
};
vi.mock(
  "@/features/originacao/components/proposta/ProposalSimulationEdit",
  () => ({
    ProposalSimulationEdit: ({
      onCancel,
      onSaved,
    }: {
      onCancel: () => void;
      onSaved: (update: QuoteDraftSimulationSnapshot) => void;
    }) => (
      <div>
        <p>Tela de edição da simulação</p>
        <button type="button" onClick={onCancel}>
          Cancelar edição
        </button>
        <button type="button" onClick={() => onSaved(updateResult)}>
          Salvar edição
        </button>
      </div>
    ),
  }),
);

const showToast = vi.fn();

function lastStepProposal(overrides: Partial<ProposalSnapshot> = {}) {
  const base = createProposalFromSimulation(
    {
      id: "sim-1",
      createdAt: "2026-10-19T12:00:00.000Z",
      status: "converted",
      name: "Maria Souza",
      birthDate: "1990-05-20",
      email: "maria@email.com",
      telephone: "11987654321",
      document: "52998224725",
      productId: "11111111-1111-4111-8111-111111111111",
      productName: "CRÉDITO PESSOAL",
      amount: 5000,
      installments: 10,
      firstInstallmentDate: "2026-11-10",
      installmentAmount: 597.88,
      interestRate: 0.0339,
    },
    { id: "quote-1", createdAt: "2026-10-19T12:01:00.000Z" },
  );
  return { ...base, step: 6, ...overrides };
}

function originacaoValue(
  overrides: Partial<OriginacaoContextValue> = {},
): OriginacaoContextValue {
  const proposal = lastStepProposal();
  return {
    activeTab: "proposal",
    setActiveTab: vi.fn(),
    eligibilityPrefill: null,
    setEligibilityPrefill: vi.fn(),
    clearEligibilityPrefill: vi.fn(),
    simulations: [],
    simulationsLoading: false,
    simulationsError: false,
    refetchSimulations: vi.fn(),
    proposals: [proposal],
    openProposalId: proposal.id,
    openingProposalId: null,
    startProposal: vi.fn(),
    openProposal: vi.fn(),
    closeProposal: vi.fn(),
    updateProposal: vi.fn(),
    ...overrides,
  };
}

function renderPage(value: OriginacaoContextValue) {
  function Shell({ children }: { children: ReactNode }) {
    return (
      <ToastContext.Provider value={{ showToast }}>
        <OriginacaoContext.Provider value={value}>
          {children}
        </OriginacaoContext.Provider>
      </ToastContext.Provider>
    );
  }
  return renderWithProviders(
    <Shell>
      <Routes>
        <Route element={<Outlet context={{ onMobileLogout: vi.fn() }} />}>
          <Route path="/" element={<PropostaPage />} />
        </Route>
      </Routes>
    </Shell>,
    { withRouter: true },
  );
}

describe("PropostaPage — editar simulação (AUREA-701)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra o link no header, ao lado do valor e do produto", () => {
    renderPage(originacaoValue());

    expect(
      screen.getByRole("button", { name: /Editar simulação/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/CRÉDITO PESSOAL/)).toBeInTheDocument();
  });

  it("não mostra o link quando o usuário não pode editar a proposta", () => {
    const proposal = lastStepProposal({ canEdit: false });
    renderPage(
      originacaoValue({ proposals: [proposal], openProposalId: proposal.id }),
    );

    expect(
      screen.queryByRole("button", { name: /Editar simulação/ }),
    ).not.toBeInTheDocument();
  });

  it("abre a edição e guarda o que já foi preenchido antes de sair do passo", async () => {
    const user = userEvent.setup();
    const updateProposal = vi.fn();
    renderPage(originacaoValue({ updateProposal }));

    await user.click(screen.getByRole("button", { name: /Editar simulação/ }));

    expect(screen.getByText("Tela de edição da simulação")).toBeInTheDocument();
    expect(updateProposal).toHaveBeenCalledTimes(1);
  });

  it("cancelar volta para a proposta, no mesmo passo", async () => {
    const user = userEvent.setup();
    renderPage(originacaoValue());

    await user.click(screen.getByRole("button", { name: /Editar simulação/ }));
    await user.click(screen.getByRole("button", { name: "Cancelar edição" }));

    expect(
      screen.queryByText("Tela de edição da simulação"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Parecer do parceiro")).toBeInTheDocument();
  });

  it("salvar atualiza as condições da proposta, volta ao Financeiro e fecha a edição", async () => {
    const user = userEvent.setup();
    const updateProposal = vi.fn();
    renderPage(originacaoValue({ updateProposal }));

    await user.click(screen.getByRole("button", { name: /Editar simulação/ }));
    updateProposal.mockClear();
    await user.click(screen.getByRole("button", { name: "Salvar edição" }));

    expect(updateProposal).toHaveBeenCalledWith(
      expect.objectContaining({
        step: FINANCIAL_STEP_INDEX,
        simulation: expect.objectContaining({
          amount: 8000,
          installments: 12,
          productName: "PRODUTO NOVO",
          installmentAmountWithInsurance: 805.7,
        }) as unknown,
      }),
    );
    expect(
      screen.queryByText("Tela de edição da simulação"),
    ).not.toBeInTheDocument();
  });
});
