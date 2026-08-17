import type { OutcomeOption } from "@/features/register-action/components/OutcomeOptionList";
import {
  ActivityInteractionResult,
  ActivityTaskType,
  RESULTS_BY_TASK_TYPE,
} from "@/services/activities/activity.enums";
import { getActivityInteractionResultLabel } from "@/services/activities/activity-interaction-labels";

const OUTCOME_DESCRIPTIONS: Partial<Record<ActivityInteractionResult, string>> =
  {
    [ActivityInteractionResult.NO_RESPONSE]: "Não atendeu ou não respondeu",
    [ActivityInteractionResult.NOT_LOCATED]:
      "Cliente não encontrado no endereço",
    [ActivityInteractionResult.PAYMENT_PROMISE]: "Confirmou que irá pagar",
    [ActivityInteractionResult.DISPUTE]: "Contesta a dívida ou os valores",
    [ActivityInteractionResult.RENEGOTIATION]:
      "Quer alterar condições do contrato",
    [ActivityInteractionResult.DECEASED]: "Informaram que o titular faleceu",
    [ActivityInteractionResult.NO_FORECAST]: "Não sabe quando poderá pagar",
    [ActivityInteractionResult.OTHER]: "Descreva nas observações",
  };

const OUTCOME_COLORS: Record<
  ActivityInteractionResult,
  OutcomeOption["color"]
> = {
  [ActivityInteractionResult.NO_RESPONSE]: "amber",
  [ActivityInteractionResult.NOT_LOCATED]: "gray",
  [ActivityInteractionResult.PAYMENT_PROMISE]: "teal",
  [ActivityInteractionResult.DISPUTE]: "red",
  [ActivityInteractionResult.RENEGOTIATION]: "amber",
  [ActivityInteractionResult.DECEASED]: "gray",
  [ActivityInteractionResult.NO_FORECAST]: "amber",
  [ActivityInteractionResult.OTHER]: "gray",
};

export function getV2InteractionOutcomeOptions(
  taskType: ActivityTaskType,
): OutcomeOption[] {
  const results = RESULTS_BY_TASK_TYPE[taskType] ?? [];

  return results.map((result) => ({
    value: result,
    label: getActivityInteractionResultLabel(result),
    desc: OUTCOME_DESCRIPTIONS[result] ?? "",
    color: OUTCOME_COLORS[result],
  }));
}

export function requiresInteractionObservation(
  result: ActivityInteractionResult,
): boolean {
  return result === ActivityInteractionResult.OTHER;
}
