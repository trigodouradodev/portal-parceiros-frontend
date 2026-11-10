import { act, render, screen, renderHook } from "@testing-library/react";
import type { ActionContextType } from "@/contexts/action/action-context";
import { TaskTab } from "@/features/dashboard/constants/task-tab";
import {
  ActivityInteractionResult,
  ActivityRecipientType,
} from "@/services/activities/activity.enums";
import { RegisterChargeStepContent } from "../components/RegisterChargeStepContent";
import { useRegisterChargeActionFlow } from "./useRegisterChargeActionFlow";

const state = vi.hoisted(() => ({
  context: {} as ActionContextType,
  mutate: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
  complete: vi.fn(),
}));
vi.mock("@/contexts/action", () => ({ useActionContext: () => state.context }));
vi.mock("react-router-dom", () => ({ useNavigate: () => state.navigate }));
vi.mock("@/contexts/toast/toast-context", () => ({
  useToast: () => ({ showToast: state.toast }),
}));
vi.mock("@/hooks/useRegisterInteraction", () => ({
  useRegisterInteraction: () => ({
    mutateAsync: state.mutate,
    isPending: false,
  }),
}));
vi.mock(
  "@/features/register-action/preventive/hooks/useVisitLocationCheck",
  () => ({
    useVisitLocationCheck: () => ({
      locationOk: true,
      coords: null,
      status: "idle",
      reset: vi.fn(),
    }),
  }),
);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-05T12:00:00Z"));
  vi.clearAllMocks();
  state.mutate.mockResolvedValue({
    interaction: { id: "interaction-1" },
    message: "Negociação encaminhada ao backoffice.",
  });
  state.context = {
    client: {
      id: "contract-1",
      installmentNumber: 6,
      name: "Maria",
      contract: "123",
      parcela: "6/12",
      value: "R$ 100",
      currentStep: "Contato",
      daysInfo: "3 dias em atraso",
      phone: "11999999999",
    },
    guarantor: { name: "José", phone: "11988888888" },
    mode: TaskTab.Charge,
    taskId: "task-1",
    contactType: "phone",
    installmentId: "i6",
    onComplete: state.complete,
    setActionData: vi.fn(),
    clearActionData: vi.fn(),
  };
});
afterEach(() => vi.useRealTimers());

describe("negociação e promessa no registro da cobrança", () => {
  it.each(["phone", "whatsapp", "visit"] as const)(
    "exige motivo em %s e envia Outro sem exigir observação",
    async (contactType) => {
      state.context.contactType = contactType;
      const { result } = renderHook(useRegisterChargeActionFlow);
      act(() => {
        result.current.setStep("outcome");
        result.current.selectOutcome(ActivityInteractionResult.NO_FORECAST);
      });
      expect(result.current.canSaveOutcome).toBe(false);
      await act(() => result.current.handleSave());
      expect(state.mutate).not.toHaveBeenCalled();
      act(() => result.current.setOverdueReason("other"));
      expect(result.current.canSaveOutcome).toBe(true);
      await act(() => result.current.handleSave());
      expect(state.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            result: "no_forecast",
            overdueReason: "other",
          }),
        }),
      );
      expect(state.mutate.mock.calls[0][0].payload.observation).toBeUndefined();
    },
  );

  it("limpa o motivo ao trocar resultado e exige nova escolha ao voltar", async () => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() => {
      result.current.setStep("outcome");
      result.current.selectOutcome(ActivityInteractionResult.NO_FORECAST);
    });
    act(() => result.current.setOverdueReason("job_loss"));
    act(() =>
      result.current.selectOutcome(ActivityInteractionResult.NO_RESPONSE),
    );
    expect(result.current.overdueReason).toBeUndefined();
    await act(() => result.current.handleSave());
    expect(state.mutate).not.toHaveBeenCalled();
    expect(result.current.canSaveOutcome).toBe(false);
    act(() =>
      result.current.selectOutcome(ActivityInteractionResult.NO_FORECAST),
    );
    expect(result.current.canSaveOutcome).toBe(false);
  });
  it("exige confirmação da data da negociação entre amanhã e D+10", () => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() => {
      result.current.setStep("outcome");
      result.current.selectOutcome(ActivityInteractionResult.RENEGOTIATION);
    });
    expect(result.current.dateModalOpen).toBe(true);
    expect(result.current.dateKind).toBe("agreement");
    expect(result.current.dateMin).toEqual(new Date(2026, 10, 6));
    expect(result.current.dateMax).toEqual(new Date(2026, 10, 15));
    expect(result.current.canSaveOutcome).toBe(false);
  });

  it("envia a data confirmada como previsão do acordo e usa a mensagem retornada pelo backend", async () => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() => {
      result.current.setStep("outcome");
      result.current.selectOutcome(ActivityInteractionResult.RENEGOTIATION);
    });
    act(() => result.current.setDraftDate(new Date(2026, 10, 10)));
    act(() => result.current.confirmOutcomeDate());
    expect(result.current.canSaveOutcome).toBe(false);
    act(() => result.current.setOverdueReason("other"));
    expect(result.current.canSaveOutcome).toBe(true);
    await act(() => result.current.handleSave());
    expect(state.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          result: "renegotiation",
          expectedAgreementDate: "2026-11-10",
        }),
      }),
    );
    expect(state.mutate.mock.calls[0][0].payload.promiseDate).toBeUndefined();
    expect(state.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Negociação encaminhada ao backoffice.",
      }),
    );
    expect(state.navigate).toHaveBeenCalledWith(
      "/",
      expect.objectContaining({ replace: true }),
    );
  });

  it("cancelar sem confirmar limpa o resultado e não permite salvar", async () => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() => {
      result.current.setStep("outcome");
      result.current.selectOutcome(ActivityInteractionResult.RENEGOTIATION);
    });
    act(() => result.current.handleDateModalOpenChange(false));
    expect(result.current.outcome).toBeNull();
    await act(() => result.current.handleSave());
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it("trocar promessa por negociação exige uma nova data, sem reaproveitar a data de pagamento", () => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() => {
      result.current.setStep("outcome");
      result.current.selectOutcome(ActivityInteractionResult.PAYMENT_PROMISE);
    });
    expect(result.current.dateMin).toEqual(new Date(2026, 10, 5));
    act(() => result.current.setDraftDate(new Date(2026, 10, 5)));
    act(() => result.current.confirmOutcomeDate());
    expect(result.current.canSaveOutcome).toBe(false);
    act(() => result.current.setOverdueReason("other"));
    expect(result.current.canSaveOutcome).toBe(true);
    act(() =>
      result.current.selectOutcome(ActivityInteractionResult.RENEGOTIATION),
    );
    expect(result.current.outcomeDate).toBeUndefined();
    expect(result.current.draftDate).toBeUndefined();
    expect(result.current.canSaveOutcome).toBe(false);
  });

  it("não confirma datas fora da janela da negociação", () => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() =>
      result.current.selectOutcome(ActivityInteractionResult.RENEGOTIATION),
    );
    act(() => result.current.setDraftDate(new Date(2026, 10, 5)));
    act(() => result.current.confirmOutcomeDate());
    expect(result.current.outcomeDate).toBeUndefined();
    expect(result.current.dateModalOpen).toBe(true);
  });
});

describe("destinatário com óbito confirmado", () => {
  it("seleciona somente o avalista vivo e usa seu telefone", () => {
    state.context.client!.isDeceased = true;
    const { result } = renderHook(useRegisterChargeActionFlow);
    expect(result.current.recipientType).toBe(ActivityRecipientType.GUARANTOR);
    expect(result.current.contactPhone).toBe("11988888888");
    expect(result.current.canContinueRecipient).toBe(true);
    act(() => result.current.setRecipientType(ActivityRecipientType.CLIENT));
    expect(result.current.recipientType).toBe(ActivityRecipientType.GUARANTOR);
  });

  it.each(["ausente", "falecido"])(
    "não permite continuar quando o avalista está %s",
    (condition) => {
      state.context.client!.isDeceased = true;
      state.context.guarantor =
        condition === "ausente"
          ? null
          : { name: "José", phone: "11988888888", isDeceased: true };
      const { result } = renderHook(useRegisterChargeActionFlow);
      expect(result.current.canContinueRecipient).toBe(false);
      if (condition === "ausente") expect(result.current.contactPhone).toBe("");
    },
  );
});

it.each([
  ActivityInteractionResult.NO_RESPONSE,
  ActivityInteractionResult.DISPUTE,
  ActivityInteractionResult.NO_FORECAST,
])("bloqueia o salvamento de %s sem motivo", async (outcome) => {
  const { result } = renderHook(useRegisterChargeActionFlow);
  act(() => {
    result.current.setStep("outcome");
    result.current.selectOutcome(outcome);
  });
  expect(result.current.canSaveOutcome).toBe(false);
  await act(() => result.current.handleSave());
  expect(state.mutate).not.toHaveBeenCalled();
  act(() => result.current.setOverdueReason("other"));
  expect(result.current.canSaveOutcome).toBe(true);
});
it.each([ActivityInteractionResult.DECEASED, ActivityInteractionResult.OTHER])(
  "não exige motivo para %s e não envia a seleção anterior",
  async (outcome) => {
    const { result } = renderHook(useRegisterChargeActionFlow);
    act(() => {
      result.current.setStep("outcome");
      result.current.selectOutcome(ActivityInteractionResult.NO_FORECAST);
    });
    act(() => result.current.setOverdueReason("job_loss"));
    act(() => {
      result.current.selectOutcome(outcome);
      result.current.setNote("Observação do contato");
    });
    expect(result.current.canSaveOutcome).toBe(true);
    await act(() => result.current.handleSave());
    expect(state.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.not.objectContaining({
          overdueReason: expect.anything(),
        }),
      }),
    );
  },
);

it.each([
  [ActivityInteractionResult.PAYMENT_PROMISE, "Data prometida para pagamento"],
  [ActivityInteractionResult.RENEGOTIATION, "Data prevista para o acordo"],
] as const)("mostra data e motivo juntos para %s", (outcome, dateLabel) => {
  const { result } = renderHook(useRegisterChargeActionFlow);
  act(() => {
    result.current.setStep("outcome");
    result.current.selectOutcome(outcome);
  });
  act(() => result.current.setDraftDate(new Date(2026, 10, 10)));
  act(() => result.current.confirmOutcomeDate());
  render(<RegisterChargeStepContent flow={result.current} />);
  expect(screen.getByText(dateLabel)).toBeInTheDocument();
  expect(screen.getByText("Motivo do atraso")).toBeInTheDocument();
  expect(result.current.canSaveOutcome).toBe(false);
});
