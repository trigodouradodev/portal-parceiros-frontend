import type { OutcomeColorKey } from "../../constants/outcome-colors";
import type { OutcomeOption } from "../../components/OutcomeOptionList";
import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import { CALL_OUTCOMES } from "@/features/dashboard/mocks/tasks";

export const COBR_TITLES: Partial<Record<CobrStage, string>> = {
  initial: "Registrar ligação inicial",
  second_attempt: "Registrar 2ª tentativa",
  third_attempt: "Registrar 3ª tentativa",
  sem_previsao: "Registrar novo contato",
  promise: "Emitir boleto",
  fup: "FUP de promessa",
};

export function getCobrOutcomeColor(value: string): OutcomeColorKey {
  if (value === "paid") return "green";
  if (value === "promise") return "teal";
  if (value === "no_return_1" || value === "no_return_2") return "amber";
  if (value === "not_paid") return "red";
  return "gray";
}

export function getCobrOutcomeOptions(
  stage: CobrStage,
  icons: Record<string, OutcomeOption["icon"]>,
): OutcomeOption[] {
  const outcomes = CALL_OUTCOMES[stage] ?? CALL_OUTCOMES.initial ?? [];

  return outcomes.map((outcome) => ({
    value: outcome.value,
    label: outcome.label,
    desc: outcome.desc,
    icon: icons[outcome.value],
    color: getCobrOutcomeColor(outcome.value),
  }));
}
