import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProposalSuccess } from "@/features/originacao/components/proposta/ProposalSuccess";
import { createProposalFromSimulation } from "@/features/originacao/data/proposal";
import { SimulationStatus } from "@/services/origination/origination.types";
import { renderWithProviders } from "@/test/render";

const showToast = vi.fn();

vi.mock("@/contexts/toast/toast-context", () => ({
  useToast: () => ({ showToast }),
}));

function proposal(telephone = "(11) 98765-4321") {
  return createProposalFromSimulation(
    {
      id: "sim-1",
      createdAt: "2026-10-15T12:00:00.000Z",
      status: SimulationStatus.CONVERTED,
      name: "Maria Silva Souza",
      birthDate: "1990-01-01",
      email: "maria@example.com",
      telephone,
      document: "52998224725",
      productId: "prod-1",
      productName: "Crédito Pessoal",
      amount: 1500,
      installments: 10,
      firstInstallmentDate: "2026-11-15",
      installmentAmount: 189.5,
      interestRate: 3.5,
    },
    { id: "quote-1", createdAt: "2026-10-15T12:00:00.000Z" },
  );
}

describe("ProposalSuccess", () => {
  beforeEach(() => {
    showToast.mockReset();
    vi.stubEnv("VITE_CLIENT_APP_URL", "https://cliente.example.com/");
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("abre o WhatsApp do cliente com a mensagem e o link do Portal do Cliente", async () => {
    renderWithProviders(
      <ProposalSuccess proposal={proposal()} onBackToList={vi.fn()} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Enviar link pelo WhatsApp/ }),
    );

    const message =
      "Olá, Maria! Sua proposta na Aurea foi criada. Acesse o Portal do Cliente para revisar os dados, dar os consentimentos e concluir a aprovação: https://cliente.example.com/";
    expect(window.open).toHaveBeenCalledWith(
      `https://wa.me/5511987654321?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("desabilita o envio pelo WhatsApp quando o celular é inválido", () => {
    renderWithProviders(
      <ProposalSuccess proposal={proposal("123")} onBackToList={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /Enviar link pelo WhatsApp/ }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copiar link" })).toBeEnabled();
  });

  it("copia o link do Portal do Cliente e confirma", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProposalSuccess proposal={proposal()} onBackToList={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Copiar link" }));

    await expect(navigator.clipboard.readText()).resolves.toBe(
      "https://cliente.example.com/",
    );
    expect(showToast).toHaveBeenCalledWith("Link copiado");
  });

  it("volta para a lista em Ver todas as propostas", async () => {
    const onBackToList = vi.fn();
    renderWithProviders(
      <ProposalSuccess proposal={proposal()} onBackToList={onBackToList} />,
    );

    const buttons = screen.getAllByRole("button", {
      name: "Ver todas as propostas",
    });
    await userEvent.click(buttons[buttons.length - 1]);

    expect(onBackToList).toHaveBeenCalled();
  });
});
