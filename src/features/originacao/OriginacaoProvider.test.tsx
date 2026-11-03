import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { ToastContext } from "@/contexts/toast/toast-context";
import { OriginacaoProvider } from "@/features/originacao/OriginacaoProvider";
import { useOriginacao } from "@/features/originacao/originacao-context";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { quoteActivityPermissionsKeys } from "@/hooks/useQuoteActivityPermissions";
import {
  PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
  PartnerRestrictionCode,
} from "@/lib/partner-restrictions";
import { originationService } from "@/services/origination/origination.service";
import { quotesService } from "@/services/quotes/quotes.service";

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

vi.mock("@/services/quotes/quotes.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/quotes/quotes.service")
  >("@/services/quotes/quotes.service");
  return {
    ...actual,
    quotesService: { ...actual.quotesService, createDraft: vi.fn() },
  };
});

const createDraft = vi.mocked(quotesService.createDraft);
const listSimulations = vi.mocked(originationService.listSimulations);
const showToast = vi.fn();

const simulation: SimulationSnapshot = {
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
};

function apiError(status: number, data: Record<string, unknown>) {
  return new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    { status, data } as AxiosResponse,
  );
}

let startResult: boolean | undefined;

function StartButton() {
  const { startProposal } = useOriginacao();
  return (
    <button
      type="button"
      onClick={async () => {
        startResult = await startProposal(simulation);
      }}
    >
      Iniciar proposta
    </button>
  );
}

function renderProvider() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  render(
    <QueryClientProvider client={client}>
      <ToastContext.Provider value={{ showToast }}>
        <OriginacaoProvider>
          <StartButton />
        </OriginacaoProvider>
      </ToastContext.Provider>
    </QueryClientProvider>,
  );
  return { invalidate };
}

describe("OriginacaoProvider.startProposal — restrição de originação (AUREA-624)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    startResult = undefined;
    listSimulations.mockResolvedValue([]);
  });

  it("403 de restrição: mostra a mensagem da API, atualiza as permissões e não abre a proposta", async () => {
    const user = userEvent.setup();
    createDraft.mockRejectedValue(
      apiError(403, {
        statusCode: 403,
        code: PartnerRestrictionCode.ORIGINATION_RESTRICTED,
        message: PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
      }),
    );
    const { invalidate } = renderProvider();

    await user.click(screen.getByRole("button", { name: "Iniciar proposta" }));

    await waitFor(() => expect(startResult).toBe(false));
    expect(showToast).toHaveBeenCalledWith(
      PARTNER_ORIGINATION_RESTRICTED_MESSAGE,
      { variant: "destructive" },
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: quoteActivityPermissionsKeys.all,
    });
  });

  it("outro erro não mexe nas permissões", async () => {
    const user = userEvent.setup();
    createDraft.mockRejectedValue(apiError(500, { message: "Erro interno" }));
    const { invalidate } = renderProvider();

    await user.click(screen.getByRole("button", { name: "Iniciar proposta" }));

    await waitFor(() => expect(startResult).toBe(false));
    expect(showToast).toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: quoteActivityPermissionsKeys.all,
    });
  });
});
