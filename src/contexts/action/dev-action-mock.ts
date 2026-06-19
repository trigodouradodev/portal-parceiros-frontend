import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { ActionClient, SetActionDataPayload } from "./action-context";

export const DEV_MOCK_CLIENT: ActionClient = {
  id: "00000000-0000-4000-8000-000000000001",
  installmentNumber: 3,
  name: "Maria Silva (dev)",
  contract: "CT-2024-001",
  parcela: "Parc 3/12",
  value: "R$ 450,00",
  currentStep: "initial",
  daysInfo: "Vence em 5 dias",
  phone: "(11) 98765-4321",
  address: "Rua das Flores, 123 — São Paulo, SP",
};

export function devCobrActionPayload(
  onComplete: SetActionDataPayload["onComplete"],
  cobrStage: CobrStage = "initial",
): SetActionDataPayload {
  return {
    mode: TaskTab.Charge,
    cobrStage,
    client: {
      ...DEV_MOCK_CLIENT,
      currentStep: cobrStage,
      daysInfo: "5 dias em atraso",
    },
    onComplete,
  };
}

export function devPrevActionPayload(
  onComplete: SetActionDataPayload["onComplete"],
): SetActionDataPayload {
  return {
    mode: TaskTab.Preventive,
    client: DEV_MOCK_CLIENT,
    onComplete,
  };
}
