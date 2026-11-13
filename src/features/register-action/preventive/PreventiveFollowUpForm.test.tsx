import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreventiveFollowUpForm } from "./PreventiveFollowUpForm";

const state = vi.hoisted(() => ({ mutate: vi.fn(), toast: vi.fn() }));
vi.mock("@/hooks/useCreateFollowUp", () => ({
  useCreateFollowUp: () => ({ mutateAsync: state.mutate, isPending: false }),
}));
vi.mock("@/contexts/toast/toast-context", () => ({
  useToast: () => ({ showToast: state.toast }),
}));
vi.mock("./hooks/useVisitLocationCheck", () => ({
  useVisitLocationCheck: () => ({
    status: "idle",
    locationOk: true,
    coords: null,
    reset: vi.fn(),
  }),
}));
const client = {
  id: "c1",
  installmentNumber: 1,
  name: "Maria",
  contract: "123",
  parcela: "1/12",
  value: "R$ 100",
  currentStep: "Contato",
  daysInfo: "3 dias em atraso",
  phone: "11999999999",
};

beforeEach(() => {
  vi.clearAllMocks();
  state.mutate.mockResolvedValue({ id: "f1" });
});

async function openOutcome(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Cliente Maria/ }));
  await user.click(screen.getByRole("button", { name: /Continuar/ }));
  await user.click(screen.getByRole("button", { name: /Ligação/ }));
  await user.click(screen.getByRole("button", { name: /Continuar/ }));
  await user.click(screen.getByRole("button", { name: /Registrar resultado/ }));
  await user.click(screen.getByRole("button", { name: /Sem previsão/ }));
}

it("Follow-up manual exige o motivo e envia Outro sem exigir observação extra", async () => {
  const user = userEvent.setup();
  const saved = vi.fn();
  render(
    <PreventiveFollowUpForm client={client} onBack={vi.fn()} onSaved={saved} />,
  );
  await openOutcome(user);
  const save = screen.getByRole("button", { name: "Registrar" });
  expect(save).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Selecione o motivo" }));
  await user.click(screen.getByRole("button", { name: "Outro" }));
  expect(save).toBeEnabled();
  await user.click(save);
  await waitFor(() =>
    expect(state.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedResult: "no_forecast",
        overdueReason: "other",
      }),
    ),
  );
  expect(state.mutate.mock.calls[0][0].note).toBeUndefined();
  expect(saved).toHaveBeenCalled();
});

it("não reaproveita o motivo ao mudar o resultado do Follow-up", async () => {
  const user = userEvent.setup();
  render(
    <PreventiveFollowUpForm
      client={client}
      onBack={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await openOutcome(user);
  await user.click(screen.getByRole("button", { name: "Selecione o motivo" }));
  await user.click(screen.getByRole("button", { name: "Perda de emprego" }));
  await user.click(screen.getByRole("button", { name: /Sem retorno/ }));
  expect(screen.getByText("Motivo do atraso")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Selecione o motivo" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Registrar" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: /Sem previsão/ }));
  expect(
    screen.getByRole("button", { name: "Selecione o motivo" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Registrar" })).toBeDisabled();
});

it.each(["Falecido", "Outro"])("oculta o motivo para %s", async (label) => {
  const user = userEvent.setup();
  render(
    <PreventiveFollowUpForm
      client={client}
      onBack={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  await openOutcome(user);
  await user.click(
    screen.getByRole("button", { name: new RegExp(`^${label}`) }),
  );
  expect(screen.queryByText("Motivo do atraso")).not.toBeInTheDocument();
});
