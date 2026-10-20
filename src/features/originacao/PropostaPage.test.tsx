import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import type { ReactNode } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { ToastContext } from "@/contexts/toast/toast-context";
import { PropostaPage } from "@/features/originacao/PropostaPage";
import {
  createEmptyProposalForm,
  createProposalFromSimulation,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import {
  OriginacaoContext,
  type OriginacaoContextValue,
} from "@/features/originacao/originacao-context";
import { useSaveQuotePartnerOpinion } from "@/features/originacao/hooks/useSaveQuotePartnerOpinion";
import { useSubmitQuoteDraft } from "@/features/originacao/hooks/useQuoteDocumentation";
import { useQuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";
import {
  PARTNER_ORIGINATION_RESTRICTED,
  PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
} from "@/lib/partner-restrictions";
import { QuoteStatus } from "@/services/quotes/quotes.enums";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/useQuoteActivityPermissions", () => ({
  useQuoteActivityPermissions: vi.fn(),
}));
vi.mock("@/features/originacao/hooks/useSaveQuotePartnerOpinion", () => ({
  useSaveQuotePartnerOpinion: vi.fn(),
}));
vi.mock("@/features/originacao/hooks/useQuoteDocumentation", () => ({
  useQuoteAttachments: () => ({ data: undefined }),
  useCompleteQuoteDocumentation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSubmitQuoteDraft: vi.fn(),
}));
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
// Hooks de passos que não participam do envio: só precisam existir.
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

const permissions = vi.mocked(useQuoteActivityPermissions);
const savePartnerOpinion = vi.mocked(useSaveQuotePartnerOpinion);
const submitDraftHook = vi.mocked(useSubmitQuoteDraft);

const showToast = vi.fn();
const submitDraft = vi.fn();
const refetchPermissions = vi.fn();

const LAST_STEP = 6;

function lastStepProposal(): ProposalSnapshot {
  const base = createProposalFromSimulation(
    {
      id: "sim-1",
      createdAt: "2026-10-19T12:00:00.000Z",
      status: "available",
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
  const form = createEmptyProposalForm();
  return {
    ...base,
    step: LAST_STEP,
    data: {
      ...base.data,
      partnerOpinion: {
        ...form.partnerOpinion,
        relationshipTime: "more_than_5_years",
        howKnows: "client",
        informalDebtSigns: false,
        financialUrgencySigns: false,
        notes: "Cliente conhecido, sem observações.",
      },
    },
  };
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

function restrictedError() {
  return new AxiosError(
    "Request failed with status code 403",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 403,
      data: {
        statusCode: 403,
        code: PARTNER_ORIGINATION_RESTRICTED,
        message: PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
      },
    } as AxiosResponse,
  );
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

describe("PropostaPage — restrição de originação (AUREA-624)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissions.mockReturnValue({
      data: { canCreateQuote: true, canSimulateQuote: true },
      isPending: false,
      refetch: refetchPermissions,
    } as unknown as ReturnType<typeof useQuoteActivityPermissions>);
    savePartnerOpinion.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    } as unknown as ReturnType<typeof useSaveQuotePartnerOpinion>);
    submitDraftHook.mockReturnValue({
      mutateAsync: submitDraft,
      isPending: false,
    } as unknown as ReturnType<typeof useSubmitQuoteDraft>);
  });

  it("envio recusado por restrição: mostra a mensagem, mantém o rascunho e não vai para Revisão do cliente", async () => {
    const user = userEvent.setup();
    submitDraft.mockRejectedValue(restrictedError());
    const updateProposal = vi.fn();
    renderPage(originacaoValue({ updateProposal }));

    await user.click(screen.getByRole("button", { name: "Concluir proposta" }));

    await waitFor(() => expect(submitDraft).toHaveBeenCalledWith("quote-1"));
    expect(showToast).toHaveBeenCalledWith(
      PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
      { variant: "destructive" },
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
    );
    expect(refetchPermissions).toHaveBeenCalled();
    // Nada de persistir CLIENT_REVIEW nem avançar: o rascunho segue editável.
    expect(updateProposal).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Concluir proposta" }),
    ).toBeInTheDocument();
  });

  it("erro de envio que não é de restrição não mostra o aviso de restrição", async () => {
    const user = userEvent.setup();
    submitDraft.mockRejectedValue(new Error("falha qualquer"));
    renderPage(originacaoValue());

    await user.click(screen.getByRole("button", { name: "Concluir proposta" }));

    await waitFor(() => expect(showToast).toHaveBeenCalled());
    expect(refetchPermissions).not.toHaveBeenCalled();
    expect(
      screen.queryByText(PARTNER_ORIGINATION_RESTRICTED_MESSAGE),
    ).not.toBeInTheDocument();
  });

  it("parceiro já restrito no perfil vê o aviso no último passo antes de tentar enviar", () => {
    permissions.mockReturnValue({
      data: {
        canCreateQuote: false,
        canSimulateQuote: true,
        originationRestricted: true,
      },
      isPending: false,
      refetch: refetchPermissions,
    } as unknown as ReturnType<typeof useQuoteActivityPermissions>);
    renderPage(originacaoValue());

    expect(
      screen.getByText(PARTNER_ORIGINATION_RESTRICTED_MESSAGE),
    ).toBeInTheDocument();
    expect(submitDraft).not.toHaveBeenCalled();
  });

  it("sem restrição o envio segue para Revisão do cliente", async () => {
    const user = userEvent.setup();
    submitDraft.mockResolvedValue(undefined);
    const updateProposal = vi.fn();
    renderPage(originacaoValue({ updateProposal }));

    await user.click(screen.getByRole("button", { name: "Concluir proposta" }));

    await waitFor(() =>
      expect(updateProposal).toHaveBeenCalledWith(
        expect.objectContaining({ status: QuoteStatus.CLIENT_REVIEW }),
      ),
    );
    expect(
      screen.queryByText(PARTNER_ORIGINATION_RESTRICTED_MESSAGE),
    ).not.toBeInTheDocument();
  });
});
