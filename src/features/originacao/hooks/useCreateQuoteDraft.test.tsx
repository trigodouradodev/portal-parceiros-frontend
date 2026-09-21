import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useCreateQuoteDraft } from "@/features/originacao/hooks/useCreateQuoteDraft";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { originationKeys } from "@/services/origination/origination.service";
import { SimulationStatus } from "@/services/origination/origination.types";
import { quotesService } from "@/services/quotes/quotes.service";
import type { QuoteDraftSnapshot } from "@/services/quotes/quotes.types";

vi.mock("@/services/quotes/quotes.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/quotes/quotes.service")
  >("@/services/quotes/quotes.service");
  return {
    ...actual,
    quotesService: {
      ...actual.quotesService,
      createDraft: vi.fn(),
    },
  };
});

const createDraft = vi.mocked(quotesService.createDraft);

const SIMULATION_ID = "11111111-1111-4111-8111-111111111111";

const simulation: SimulationSnapshot = {
  id: SIMULATION_ID,
  createdAt: "2026-09-14T12:00:00.000Z",
  status: SimulationStatus.AVAILABLE,
  name: "Maria Souza",
  birthDate: "1990-05-20",
  email: "maria@email.com",
  telephone: "11987654321",
  document: "52998224725",
  productId: "22222222-2222-4222-8222-222222222222",
  productName: "CRÉDITO PESSOAL",
  amount: 5000,
  installments: 10,
  firstInstallmentDate: "2026-10-10",
  installmentAmount: 597.88,
};

const preview = {
  productId: simulation.productId,
  amount: 5000,
  installments: 10,
  firstInstallmentDate: "2026-10-10",
  interestRate: 0.0339,
  installmentAmount: 597.88,
  totalAmountOwed: 5978.8,
};

const draft: QuoteDraftSnapshot = {
  id: "quote-1",
  simulationId: SIMULATION_ID,
  status: "draft",
  createdAt: "2026-09-14T12:01:00.000Z",
  name: simulation.name,
  document: simulation.document,
  birthDate: simulation.birthDate,
  email: simulation.email,
  telephone: simulation.telephone,
  productId: simulation.productId,
  productName: simulation.productName,
  interestRate: 0.0339,
  financeAmount: simulation.amount,
  installmentNumbers: simulation.installments,
  firstInstallmentDate: simulation.firstInstallmentDate,
  installmentAmount: simulation.installmentAmount,
};

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useCreateQuoteDraft", () => {
  beforeEach(() => {
    createDraft.mockReset();
    createDraft.mockResolvedValue(draft);
  });

  it("marks the simulation converted without crashing on cached preview data", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    client.setQueryData(originationKeys.simulations(), [simulation]);
    // Shape that used to live under simulationsRoot and made .map throw.
    client.setQueryData(
      [...originationKeys.simulationsRoot(), "preview", preview],
      preview,
    );

    const { result } = renderHook(() => useCreateQuoteDraft(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await expect(result.current.mutateAsync(SIMULATION_ID)).resolves.toEqual(
        draft,
      );
    });

    expect(createDraft).toHaveBeenCalledWith({ simulationId: SIMULATION_ID });
    expect(client.getQueryData(originationKeys.simulations())).toEqual([
      { ...simulation, status: SimulationStatus.CONVERTED },
    ]);
    expect(
      client.getQueryData([
        ...originationKeys.simulationsRoot(),
        "preview",
        preview,
      ]),
    ).toEqual(preview);
  });
});
