import type { OutcomeColorKey } from "../../constants/outcome-colors";
import type { OutcomeOption } from "../../components/OutcomeOptionList";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import {
  ChargeOutcome,
  type ChargeOutcome as ChargeOutcomeValue,
} from "@/features/register-action/charge/types";
import { getChannelRegisterTitle } from "@/features/dashboard/utils/charge-channel";

const BASE_OUTCOMES: {
  value: ChargeOutcomeValue;
  label: string;
  desc: string;
}[] = [
  {
    value: ChargeOutcome.NO_RETURN,
    label: "Sem retorno",
    desc: "Contato realizado sem resposta do cliente",
  },
  {
    value: ChargeOutcome.PAYMENT_PROMISE,
    label: "Promessa de pagamento",
    desc: "Cliente confirmou que irá pagar",
  },
  {
    value: ChargeOutcome.WANTS_RENEGOTIATION,
    label: "Renegociação",
    desc: "Cliente quer alterar condições do contrato",
  },
  {
    value: ChargeOutcome.REQUESTED_EXTENSION,
    label: "Pediu prorrogação",
    desc: "Cliente solicitou mais prazo para pagar",
  },
];

const VISIT_OUTCOMES: typeof BASE_OUTCOMES = [
  {
    value: ChargeOutcome.NO_RETURN,
    label: "Não localizado",
    desc: "Cliente não encontrado no endereço",
  },
  ...BASE_OUTCOMES.slice(1),
];

const OUTCOMES_BY_CHANNEL: Record<ActivityChannel, typeof BASE_OUTCOMES> = {
  [ActivityChannel.WHATSAPP_MESSAGE]: BASE_OUTCOMES,
  [ActivityChannel.CLIENT_CALL]: BASE_OUTCOMES,
  [ActivityChannel.CLIENT_VISIT]: VISIT_OUTCOMES,
};

export function getChargeRegisterTitle(channel: ActivityChannel): string {
  return getChannelRegisterTitle(channel);
}

export function getOutcomeColor(value: ChargeOutcomeValue): OutcomeColorKey {
  if (value === ChargeOutcome.PAYMENT_PROMISE) return "teal";
  if (value === ChargeOutcome.WILL_PAY_ON_DATE) return "green";
  if (value === ChargeOutcome.NO_RETURN) return "amber";
  if (value === ChargeOutcome.WANTS_RENEGOTIATION) return "blue";
  return "gray";
}

export function getOutcomeOptions(
  channel: ActivityChannel,
  icons: Partial<Record<ChargeOutcomeValue, OutcomeOption["icon"]>>,
): OutcomeOption[] {
  const outcomes = OUTCOMES_BY_CHANNEL[channel] ?? BASE_OUTCOMES;

  return outcomes.map((outcome) => ({
    value: outcome.value,
    label: outcome.label,
    desc: outcome.desc,
    icon: icons[outcome.value],
    color: getOutcomeColor(outcome.value),
  }));
}
