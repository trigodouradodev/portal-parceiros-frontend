import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useSimulate } from "@/features/originacao/hooks/useSimulate";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

vi.mock("@/services/origination/origination.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/origination/origination.service")
  >("@/services/origination/origination.service");
  return {
    ...actual,
    originationService: { ...actual.originationService, simulate: vi.fn() },
  };
});

const simulate = vi.mocked(originationService.simulate);
const simulation: SimulationSnapshot = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  createdAt: "2026-09-21T12:00:00.000Z",
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
  firstInstallmentDate: "2026-10-05",
  installmentAmount: 597.88,
  totalAmountOwed: 5978.8,
};

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useSimulate", () => {
  beforeEach(() => simulate.mockReset());

  it("updates the cached row instead of duplicating a resimulation", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    client.setQueryData(originationKeys.simulations(), [simulation]);
    const updated = { ...simulation, amount: 8000, installmentAmount: 901.23 };
    simulate.mockResolvedValue({ eligible: true, simulation: updated });
    const { result } = renderHook(() => useSimulate(), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync({
        simulationId: simulation.id,
        name: simulation.name,
        document: simulation.document,
        birthDate: simulation.birthDate,
        email: simulation.email,
        telephone: simulation.telephone,
        productId: simulation.productId,
        amount: updated.amount,
        installments: simulation.installments,
        firstInstallmentDate: simulation.firstInstallmentDate,
      });
    });

    expect(client.getQueryData(originationKeys.simulations())).toEqual([
      updated,
    ]);
  });

  it("does not change the cache for an ineligible customer", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    client.setQueryData(originationKeys.simulations(), [simulation]);
    simulate.mockResolvedValue({ eligible: false, simulation: null });
    const { result } = renderHook(() => useSimulate(), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync({
        name: simulation.name,
        document: simulation.document,
        birthDate: simulation.birthDate,
        email: simulation.email,
        telephone: simulation.telephone,
        productId: simulation.productId,
        amount: simulation.amount,
        installments: simulation.installments,
        firstInstallmentDate: simulation.firstInstallmentDate,
      });
    });

    expect(client.getQueryData(originationKeys.simulations())).toEqual([
      simulation,
    ]);
  });
});
