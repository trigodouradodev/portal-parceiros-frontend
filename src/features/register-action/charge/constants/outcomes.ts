import type { OutcomeColorKey } from "../../constants/outcome-colors";
import type { OutcomeOption } from "../../components/OutcomeOptionList";
import type { ChargeStage } from "@/features/dashboard/mocks/tasks";
import { CALL_OUTCOMES } from "@/features/dashboard/mocks/tasks";
import {
  ChargeOutcome,
  type ChargeOutcome as ChargeOutcomeValue,
} from "@/features/register-action/charge/types";

export const CHARGE_TITLES: Partial<Record<ChargeStage, string>> = {
  initial: "Registrar ligação inicial",
  second_attempt: "Registrar 2ª tentativa",
  third_attempt: "Registrar 3ª tentativa",
  sem_previsao: "Registrar novo contato",
  promise: "Registrar promessa de pagamento",
  fup: "FUP de promessa",
};

export function getOutcomeColor(value: ChargeOutcomeValue): OutcomeColorKey {
  if (value === ChargeOutcome.PAID) return "green";
  if (value === ChargeOutcome.PROMISE) return "teal";
  if (value === ChargeOutcome.NO_RETURN) return "amber";
  if (value === ChargeOutcome.NOT_PAID) return "red";
  return "gray";
}

export function getOutcomeOptions(
  stage: ChargeStage,
  icons: Partial<Record<ChargeOutcomeValue, OutcomeOption["icon"]>>,
): OutcomeOption[] {
  const outcomes = CALL_OUTCOMES[stage] ?? CALL_OUTCOMES.initial ?? [];

  return outcomes.map((outcome) => ({
    value: outcome.value,
    label: outcome.label,
    desc: outcome.desc,
    icon: icons[outcome.value as ChargeOutcomeValue],
    color: getOutcomeColor(outcome.value as ChargeOutcomeValue),
  }));
}
