import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { ToastContext } from "@/contexts/toast/toast-context";
import { ProposalSimulationEdit } from "@/features/originacao/components/proposta/ProposalSimulationEdit";
import {
  createProposalFromSimulation,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { toIsoDate } from "@/features/originacao/data/simulacao";
import { quotesService } from "@/services/quotes/quotes.service";
import { renderWithProviders } from "@/test/render";
import type { QuoteDraftSimulationSnapshot } from "@/services/quotes/quotes.types";

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({
    data: [
      {
        id: PRODUCT_ID,
        description: "CRÉDITO PESSOAL",
        minInterestRate: 0.02,
        maxInterestRate: 0.0339,
        minInstallmentCount: 2,
        maxInstallmentCount: 12,
        enabled: true,
      },
    ],
    isLoading: false,
  }),
}));

vi.mock(
  "@/features/originacao/utils/scroll-to-first-error",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/originacao/utils/scroll-to-first-error")
    >()),
    scrollTaskToTop: vi.fn(),
    scrollToFirstError: vi.fn(),
  }),
);

vi.mock("@/services/quotes/quotes.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/quotes/quotes.service")
  >("@/services/quotes/quotes.service");
  return {
    ...actual,
    quotesService: { ...actual.quotesService, updateDraftSimulation: vi.fn() },
  };
});

const updateDraftSimulation = vi.mocked(quotesService.updateDraftSimulation);
const showToast = vi.fn();

/** Próximo dia 5/10/15/20 dentro da janela da primeira parcela. */
function allowedDueDate(): string {
  const date = new Date();
  for (let offset = 1; offset <= 45; offset += 1) {
    const candidate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + offset,
    );
    if ([5, 10, 15, 20].includes(candidate.getDate()))
      return toIsoDate(candidate);
  }
  throw new Error("sem data válida na janela");
}

function buildProposal(): ProposalSnapshot {
  return createProposalFromSimulation(
    {
      id: "sim-1",
      createdAt: "2026-10-19T12:00:00.000Z",
      status: "converted",
      name: "Maria Souza",
      birthDate: "1990-05-20",
      email: "maria@email.com",
      telephone: "11987654321",
      document: "52998224725",
      productId: PRODUCT_ID,
      productName: "CRÉDITO PESSOAL",
      amount: 5000,
      installments: 10,
      firstInstallmentDate: allowedDueDate(),
      installmentAmount: 597.88,
      interestRate: 0.0339,
    },
    { id: "quote-1", createdAt: "2026-10-19T12:01:00.000Z" },
  );
}

const updated: QuoteDraftSimulationSnapshot = {
  id: "quote-1",
  simulationId: "sim-1",
  productId: PRODUCT_ID,
  productName: "CRÉDITO PESSOAL",
  interestRate: 0.0339,
  financeAmount: 5000,
  installmentNumbers: 12,
  firstInstallmentDate: allowedDueDate(),
  installmentAmount: 510.2,
  installmentAmountWithInsurance: 533.1,
  insurancePremium: 190,
  totalAmountOwed: 6122.4,
};

function renderEdit(props: {
  onCancel?: () => void;
  onSaved?: (update: QuoteDraftSimulationSnapshot) => void;
}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithProviders(
    <QueryClientProvider client={client}>
      <ToastContext.Provider value={{ showToast }}>
        <ProposalSimulationEdit
          proposal={buildProposal()}
          onCancel={props.onCancel ?? vi.fn()}
          onSaved={props.onSaved ?? vi.fn()}
        />
      </ToastContext.Provider>
    </QueryClientProvider>,
  );
}

function apiError(status: number, data: Record<string, unknown>) {
  return new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    { status, data } as AxiosResponse,
  );
}

describe("ProposalSimulationEdit (AUREA-701)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("abre com as condições atuais da proposta e avisa que o seguro será recotado", () => {
    renderEdit({});

    expect(screen.getByText("CRÉDITO PESSOAL")).toBeInTheDocument();
    expect(screen.getByDisplayValue("R$ 5.000,00")).toBeInTheDocument();
    expect(
      screen.getByText(/O seguro será cotado de novo/),
    ).toBeInTheDocument();
  });

  it("salva as novas condições e devolve o resultado recalculado", async () => {
    const user = userEvent.setup();
    updateDraftSimulation.mockResolvedValue(updated);
    const onSaved = vi.fn();
    renderEdit({ onSaved });

    await user.click(screen.getByText("12x"));
    await user.click(
      screen.getByRole("button", { name: "Salvar e recalcular" }),
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(updated));
    expect(updateDraftSimulation).toHaveBeenCalledWith("quote-1", {
      productId: PRODUCT_ID,
      amount: 5000,
      installments: 12,
      firstInstallmentDate: allowedDueDate(),
    });
    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining("Simulação atualizada"),
    );
  });

  it("cliente inelegível ao seguro: mostra a mensagem da API e não conclui", async () => {
    const user = userEvent.setup();
    const message =
      "Com este valor e prazo o cliente não é elegível ao seguro prestamista. Reduza o prazo ou ajuste a data da primeira parcela.";
    updateDraftSimulation.mockRejectedValue(
      apiError(400, { code: "INSURANCE_INELIGIBLE", message }),
    );
    const onSaved = vi.fn();
    renderEdit({ onSaved });

    await user.click(
      screen.getByRole("button", { name: "Salvar e recalcular" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(showToast).toHaveBeenCalledWith(message, { variant: "destructive" });
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("cancelar volta para a proposta sem salvar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderEdit({ onCancel });

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(updateDraftSimulation).not.toHaveBeenCalled();
  });
});
