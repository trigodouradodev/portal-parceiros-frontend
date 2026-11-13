import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import type { ReactNode } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { ToastContext } from "@/contexts/toast/toast-context";
import { PropostaPage } from "@/features/originacao/PropostaPage";
import {
  createEmptyProposalForm,
  createProposalFromSimulation,
  FINANCIAL_STEP_INDEX,
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
  PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
  PartnerRestrictionCode,
} from "@/lib/partner-restrictions";
import type { QuoteDraftSimulationSnapshot } from "@/services/quotes/quotes.types";
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

const declineDraft = vi.hoisted(() => vi.fn());
vi.mock("@/features/originacao/hooks/useDeclineQuoteDraft", () => ({
  useDeclineQuoteDraft: () => ({ mutateAsync: declineDraft, isPending: false }),
}));

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
    ...overrides,
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
        code: PartnerRestrictionCode.ORIGINATION_RESTRICTED,
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

function mockPartnerHooks() {
  vi.clearAllMocks();
  permissions.mockReturnValue({
    data: { canCreateQuote: true, canSimulateQuote: true },
    dataUpdatedAt: 0,
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
}

describe("PropostaPage — restrição de originação (AUREA-624)", () => {
  beforeEach(mockPartnerHooks);

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

  it("restrição liberada pelo Backoffice: a nova consulta do perfil tira o aviso mantido pelo envio recusado", async () => {
    const user = userEvent.setup();
    submitDraft.mockRejectedValue(restrictedError());
    // O refetch do perfil volta sem restrição, com data posterior ao 403.
    refetchPermissions.mockImplementation(() => {
      permissions.mockReturnValue({
        data: { canCreateQuote: true, canSimulateQuote: true },
        dataUpdatedAt: Date.now() + 60_000,
        isPending: false,
        refetch: refetchPermissions,
      } as unknown as ReturnType<typeof useQuoteActivityPermissions>);
      return Promise.resolve();
    });
    renderPage(originacaoValue());

    await user.click(screen.getByRole("button", { name: "Concluir proposta" }));

    await waitFor(() => expect(refetchPermissions).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.queryByText(PARTNER_ORIGINATION_RESTRICTED_MESSAGE),
      ).not.toBeInTheDocument(),
    );
  });

  it("consulta do perfil que falha não libera o aviso do envio recusado", async () => {
    const user = userEvent.setup();
    submitDraft.mockRejectedValue(restrictedError());
    // O react-query não rejeita: a consulta falha e `dataUpdatedAt` não muda.
    refetchPermissions.mockResolvedValue(undefined);
    renderPage(originacaoValue());

    await user.click(screen.getByRole("button", { name: "Concluir proposta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
    );
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
      dataUpdatedAt: 0,
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

describe("PropostaPage — editar simulação (AUREA-701)", () => {
  beforeEach(mockPartnerHooks);

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

describe("PropostaPage — recusar proposta da Canal Digital", () => {
  beforeEach(mockPartnerHooks);

  function digitalProposal() {
    return lastStepProposal({ canDecline: true });
  }

  it("mostra Recusar proposta só quando o parceiro pode recusar", () => {
    const withoutPermission = lastStepProposal({ canDecline: false });
    const { unmount } = renderPage(
      originacaoValue({
        proposals: [withoutPermission],
        openProposalId: withoutPermission.id,
      }),
    );
    expect(
      screen.queryByRole("button", { name: "Recusar proposta" }),
    ).not.toBeInTheDocument();
    unmount();

    const proposal = digitalProposal();
    renderPage(
      originacaoValue({ proposals: [proposal], openProposalId: proposal.id }),
    );
    expect(
      screen.getByRole("button", { name: "Recusar proposta" }),
    ).toBeInTheDocument();
  });

  it("recusa com o motivo, avisa e volta para a lista", async () => {
    const user = userEvent.setup();
    const closeProposal = vi.fn();
    const proposal = digitalProposal();
    declineDraft.mockResolvedValue({ status: "declined" });
    renderPage(
      originacaoValue({
        proposals: [proposal],
        openProposalId: proposal.id,
        closeProposal,
      }),
    );

    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Recusar proposta",
    });
    await user.click(
      within(dialog).getByRole("radio", { name: "Cadastro duplicado" }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Recusar proposta" }),
    );

    await waitFor(() =>
      expect(declineDraft).toHaveBeenCalledWith({
        quoteId: proposal.id,
        payload: { reason: "duplicate_registration" },
      }),
    );
    await waitFor(() => expect(closeProposal).toHaveBeenCalled());
    expect(showToast).toHaveBeenCalledWith("Proposta recusada.");
  });

  it("preserva motivo e observação quando a recusa falha e permite tentar novamente", async () => {
    const user = userEvent.setup();
    const closeProposal = vi.fn();
    const proposal = digitalProposal();
    declineDraft
      .mockRejectedValueOnce(new Error("conflito"))
      .mockResolvedValueOnce({ status: "declined" });
    renderPage(
      originacaoValue({
        proposals: [proposal],
        openProposalId: proposal.id,
        closeProposal,
      }),
    );

    await user.click(screen.getByRole("button", { name: "Recusar proposta" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("radio", {
        name: "Desistiu sem informar o motivo",
      }),
    );
    await user.type(within(dialog).getByRole("textbox"), "Falou com o gerente");
    await user.click(
      within(dialog).getByRole("button", { name: "Recusar proposta" }),
    );

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ variant: "destructive" }),
      ),
    );
    expect(closeProposal).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(within(dialog).getByRole("textbox")).toHaveValue(
      "Falou com o gerente",
    );

    await user.click(
      within(dialog).getByRole("button", { name: "Recusar proposta" }),
    );

    await waitFor(() => expect(closeProposal).toHaveBeenCalledTimes(1));
    expect(declineDraft).toHaveBeenCalledTimes(2);
    expect(declineDraft).toHaveBeenNthCalledWith(1, {
      quoteId: proposal.id,
      payload: { reason: "gave_up_no_reason", note: "Falou com o gerente" },
    });
    expect(declineDraft).toHaveBeenNthCalledWith(2, {
      quoteId: proposal.id,
      payload: { reason: "gave_up_no_reason", note: "Falou com o gerente" },
    });
    expect(showToast).toHaveBeenCalledWith("Proposta recusada.");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
