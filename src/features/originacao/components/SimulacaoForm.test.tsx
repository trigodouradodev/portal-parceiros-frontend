import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, screen, waitFor } from "@testing-library/react";
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
import { partiesService } from "@/services/parties/parties.service";
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
      simulate: vi.fn(),
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

vi.mock("@/services/parties/parties.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/parties/parties.service")
  >("@/services/parties/parties.service");
  return {
    ...actual,
    partiesService: {
      ...actual.partiesService,
      findFormDataByCpf: vi.fn(),
    },
  };
});

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";

const getProfile = vi.mocked(authService.getProfile);
const getProducts = vi.mocked(productsService.getProducts);
const findFormDataByCpf = vi.mocked(partiesService.findFormDataByCpf);
const simulate = vi.mocked(originationService.simulate);

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
      screen.getByRole("button", { name: "Simular novamente" }),
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
    findFormDataByCpf.mockReset();
    simulate.mockReset();

    getProfile.mockResolvedValue(testUser);
    findFormDataByCpf.mockResolvedValue(null);
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
    simulate.mockResolvedValue({
      eligible: true,
      simulation: snapshot(),
    });
  });

  it("offers simulate without calling the API while the user fills the form", async () => {
    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={null}
        hasList={false}
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Simular" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Iniciar proposta" }),
    ).not.toBeInTheDocument();
    expect(simulate).not.toHaveBeenCalled();
  });

  it("resimulates an existing row using its UUID and shows the saved result", async () => {
    const user = userEvent.setup();
    const editing = snapshot();
    const saved = snapshot({ amount: 5000 });
    simulate.mockResolvedValue({
      eligible: true,
      simulation: saved,
    });
    const onStartProposal = vi.fn();

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={editing}
        hasList
        onViewList={vi.fn()}
        onStartProposal={onStartProposal}
      />,
    );

    await waitForReady();
    await user.click(screen.getByRole("button", { name: "Simular novamente" }));

    await waitFor(() => {
      expect(simulate).toHaveBeenCalledWith(
        expect.objectContaining({
          simulationId: editing.id,
          name: "Maria Souza",
          document: "52998224725",
          productId: PRODUCT_ID,
        }),
        expect.anything(),
      );
    });
    expect(screen.getByText("Simulação concluída")).toBeInTheDocument();
    expect(screen.getByText("10x de R$ 597,88")).toBeInTheDocument();
    expect(screen.queryByText("Taxa mensal")).not.toBeInTheDocument();
    expect(screen.queryByText("Total devido")).not.toBeInTheDocument();
    expect(onStartProposal).not.toHaveBeenCalled();
  });

  it("starts a proposal from the latest persisted simulation", async () => {
    const user = userEvent.setup();
    const editing = snapshot();
    const onStartProposal = vi.fn().mockResolvedValue(undefined);

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={editing}
        hasList
        onViewList={vi.fn()}
        onStartProposal={onStartProposal}
      />,
    );

    await waitForReady();
    await user.click(screen.getByRole("button", { name: "Iniciar proposta" }));

    expect(onStartProposal).toHaveBeenCalledWith(editing);
    expect(simulate).not.toHaveBeenCalled();
  });

  it("disables start proposal when the partner cannot create quotes", async () => {
    getProfile.mockResolvedValue({ ...testUser, canCreateQuote: false });

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={snapshot()}
        hasList
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Simular novamente" }),
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
        onStartProposal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Simular novamente" }),
      ).toBeDisabled();
    });
    expect(
      screen.queryByRole("button", { name: "Iniciar proposta" }),
    ).not.toBeInTheDocument();
  });

  it("shows ineligibility without keeping the previous result actionable", async () => {
    const user = userEvent.setup();
    simulate.mockResolvedValueOnce({ eligible: false, simulation: null });

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={snapshot()}
        hasList
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitForReady();
    await user.click(screen.getByRole("button", { name: "Simular novamente" }));

    expect(await screen.findByText("Cliente não elegível")).toBeInTheDocument();
    expect(screen.queryByText("Simulação concluída")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Iniciar proposta" }),
    ).not.toBeInTheDocument();
  });

  it("invalidates the saved result after a form change", async () => {
    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={snapshot()}
        hasList
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitForReady();
    fireEvent.change(screen.getByRole("slider"), {
      target: { value: "6000" },
    });

    expect(
      screen.getByText(
        "Os dados foram alterados. Simule novamente para atualizar o resultado.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Simulação concluída")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Iniciar proposta" }),
    ).not.toBeInTheDocument();
  });

  it("places CPF before name so lookup can fill the remaining fields", async () => {
    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={null}
        hasList={false}
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    const cpf = await screen.findByPlaceholderText("000.000.000-00");
    const name = screen.getByPlaceholderText("Nome do cliente");
    expect(
      cpf.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("fills name, email and phone from the party lookup after a valid CPF", async () => {
    const user = userEvent.setup();
    findFormDataByCpf.mockResolvedValue({
      name: "Maria Souza",
      document: "52998224725",
      email: "maria@email.com",
      telephone: "+5511987654321",
      address: null,
    });

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={null}
        hasList={false}
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await user.type(
      await screen.findByPlaceholderText("000.000.000-00"),
      "52998224725",
    );

    await waitFor(() => {
      expect(findFormDataByCpf).toHaveBeenCalledWith(
        "52998224725",
        expect.anything(),
      );
    });
    expect(screen.getByPlaceholderText("Nome do cliente")).toHaveValue(
      "Maria Souza",
    );
    expect(screen.getByPlaceholderText("cliente@email.com")).toHaveValue(
      "maria@email.com",
    );
    expect(screen.getByPlaceholderText("(11) 99999-0000")).toHaveValue(
      "(11) 98765-4321",
    );
    expect(
      screen.getByText("Cadastro encontrado e preenchido automaticamente"),
    ).toBeInTheDocument();
  });

  it("does not look up an incomplete CPF", async () => {
    const user = userEvent.setup();

    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={null}
        hasList={false}
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await user.type(
      await screen.findByPlaceholderText("000.000.000-00"),
      "529",
    );

    expect(findFormDataByCpf).not.toHaveBeenCalled();
  });

  it("looks up a prefilled CPF from eligibility on mount", async () => {
    findFormDataByCpf.mockResolvedValue({
      name: "Maria Souza",
      document: "52998224725",
      email: "maria@email.com",
      telephone: "11987654321",
      address: null,
    });

    renderForm(
      <SimulacaoForm
        prefill={{
          name: "Maria Souza",
          cpf: "52998224725",
          birthDate: "1990-05-20",
        }}
        editing={null}
        hasList={false}
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(findFormDataByCpf).toHaveBeenCalledWith(
        "52998224725",
        expect.anything(),
      );
    });
    expect(screen.getByPlaceholderText("cliente@email.com")).toHaveValue(
      "maria@email.com",
    );
    expect(screen.getByPlaceholderText("(11) 99999-0000")).toHaveValue(
      "(11) 98765-4321",
    );
  });

  it("locks the CPF and does not look it up when editing a saved simulation", async () => {
    renderForm(
      <SimulacaoForm
        prefill={null}
        editing={snapshot()}
        hasList
        onViewList={vi.fn()}
        onStartProposal={vi.fn()}
      />,
    );

    await waitForReady();
    expect(screen.getByPlaceholderText("000.000.000-00")).toBeDisabled();
    expect(findFormDataByCpf).not.toHaveBeenCalled();
  });
});
