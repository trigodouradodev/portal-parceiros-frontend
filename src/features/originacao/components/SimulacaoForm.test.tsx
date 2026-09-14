import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { ToastProvider } from "@/contexts/toast/ToastContext";
import { SimulacaoForm } from "@/features/originacao/components/SimulacaoForm";
import {
  ALLOWED_DUE_DAYS,
  toIsoDate,
} from "@/features/originacao/data/simulacao";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { authService } from "@/services/auth/auth.service";
import { originationService } from "@/services/origination/origination.service";
import { productsService } from "@/services/products/products.service";
import { renderWithProviders, testUser } from "@/test/render";

vi.mock("@/services/auth/auth.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/auth/auth.service")
  >("@/services/auth/auth.service");
  return {
    ...actual,
    authService: {
      ...actual.authService,
      getProfile: vi.fn(),
    },
  };
});

vi.mock("@/services/origination/origination.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/origination/origination.service")
  >("@/services/origination/origination.service");
  return {
    ...actual,
    originationService: {
      ...actual.originationService,
      previewSimulation: vi.fn(),
      createSimulation: vi.fn(),
      updateSimulation: vi.fn(),
    },
  };
});

vi.mock("@/services/products/products.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/products/products.service")
  >("@/services/products/products.service");
  return {
    ...actual,
    productsService: {
      ...actual.productsService,
      getProducts: vi.fn(),
    },
  };
});

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";

const getProfile = vi.mocked(authService.getProfile);
const getProducts = vi.mocked(productsService.getProducts);
const createSimulation = vi.mocked(originationService.createSimulation);
const updateSimulation = vi.mocked(originationService.updateSimulation);
const previewSimulation = vi.mocked(originationService.previewSimulation);

function nextAllowedDueIso() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = 0; offset <= 45; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    if (ALLOWED_DUE_DAYS.includes(date.getDate())) {
      return toIsoDate(date);
    }
  }
  throw new Error("No allowed due date in the simulation window");
}

function snapshot(
  overrides: Partial<SimulationSnapshot> = {},
): SimulationSnapshot {
  return {
    id: "sim-a",
    createdAt: "2026-08-26T12:00:00.000Z",
    status: "available",
    name: "Maria Souza",
    birthDate: "1990-05-20",
    email: "maria@email.com",
    telephone: "11987654321",
    document: "52998224725",
    productId: PRODUCT_ID,
    productName: "CRÉDITO PESSOAL",
    interestRate: 0.0339,
    amount: 5000,
    installments: 10,
    firstInstallmentDate: nextAllowedDueIso(),
    installmentAmount: 597.88,
    ...overrides,
  };
}

function renderForm(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithProviders(
    <QueryClientProvider client={client}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>,
  );
}

async function waitForReady(canCreateQuote = true) {
  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Salvar simulação" }),
    ).toBeEnabled();
  });
  if (canCreateQuote) {
    expect(
      screen.getByRole("button", { name: "Iniciar proposta" }),
    ).toBeEnabled();
  }
}

describe("SimulacaoForm", () => {
  beforeEach(() => {
    getProfile.mockReset();
    getProducts.mockReset();
    createSimulation.mockReset();
    updateSimulation.mockReset();
    previewSimulation.mockReset();

    getProfile.mockResolvedValue(testUser);
    getProducts.mockResolvedValue([
      {
        id: PRODUCT_ID,
        description: "CRÉDITO PESSOAL",
        minInterestRate: 0.02,
        maxInterestRate: 0.0339,
        minInstallmentCount: 2,
        maxInstallmentCount: 12,
        enabled: true,
      },
    ]);
    previewSimulation.mockResolvedValue({
      productId: PRODUCT_ID,
      amount: 5000,
      installments: 10,
      firstInstallmentDate: nextAllowedDueIso(),
      interestRate: 0.0339,
      installmentAmount: 597.88,
      totalAmountOwed: 5978.8,
    });
  });

  it("offers save and start proposal after a new simulation", async () => {
    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={null}
        hasList={false}
        onViewList={vi.fn()}
        onCompleted={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Salvar simulação" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Iniciar proposta" }),
    ).toBeInTheDocument();
  });

  it("saves without starting a proposal", async () => {
    const user = userEvent.setup();
    const editing = snapshot();
    const saved = snapshot({ amount: 5000 });
    updateSimulation.mockResolvedValue(saved);
    const onCompleted = vi.fn();
    const onStartProposal = vi.fn();

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={editing}
        hasList
        onViewList={vi.fn()}
        onCompleted={onCompleted}
        onStartProposal={onStartProposal}
      />,
    );

    await waitForReady();
    await user.click(screen.getByRole("button", { name: "Salvar simulação" }));

    await waitFor(() => {
      expect(updateSimulation).toHaveBeenCalledWith(
        editing.id,
        expect.objectContaining({
          name: "Maria Souza",
          document: "52998224725",
          productId: PRODUCT_ID,
        }),
      );
    });
    expect(onCompleted).toHaveBeenCalled();
    expect(onStartProposal).not.toHaveBeenCalled();
  });

  it("saves and then starts a proposal from the same form", async () => {
    const user = userEvent.setup();
    const editing = snapshot();
    const saved = snapshot({ amount: 5000 });
    updateSimulation.mockResolvedValue(saved);
    const onCompleted = vi.fn();
    const onStartProposal = vi.fn().mockResolvedValue(undefined);

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={editing}
        hasList
        onViewList={vi.fn()}
        onCompleted={onCompleted}
        onStartProposal={onStartProposal}
      />,
    );

    await waitForReady();
    await user.click(screen.getByRole("button", { name: "Iniciar proposta" }));

    await waitFor(() => {
      expect(updateSimulation).toHaveBeenCalled();
    });
    expect(onStartProposal).toHaveBeenCalledWith(saved);
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("disables start proposal when the partner cannot create quotes", async () => {
    getProfile.mockResolvedValue({ ...testUser, canCreateQuote: false });

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={snapshot()}
        hasList
        onViewList={vi.fn()}
        onCompleted={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Salvar simulação" }),
      ).toBeEnabled();
    });
    expect(
      screen.getByText(
        "Você possui ações de cobrança pendentes que impedem iniciar uma proposta.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Iniciar proposta" }),
    ).toBeDisabled();
  });

  it("hides start proposal when the simulation already originated a quote", async () => {
    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={snapshot({ status: "converted" })}
        hasList
        onViewList={vi.fn()}
        onCompleted={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Salvar simulação" }),
      ).toBeEnabled();
    });
    expect(
      screen.queryByRole("button", { name: "Iniciar proposta" }),
    ).not.toBeInTheDocument();
  });
});
