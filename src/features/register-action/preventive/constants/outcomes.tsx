import {
  Calendar,
  CheckCircle2,
  CircleAlert,
  Ellipsis,
  Handshake,
  HeartCrack,
  MapPinOff,
  PhoneOff,
} from "lucide-react";
import type { OutcomeOption } from "@/features/register-action/components/OutcomeOptionList";

export const OUTCOMES: OutcomeOption[] = [
  {
    value: "confirmed",
    label: "Pagará no dia",
    desc: "Cliente confirmou que pagará",
    icon: <CheckCircle2 size={18} />,
    color: "green",
  },
  {
    value: "no_return",
    label: "Sem retorno",
    desc: "Não atendeu / não respondeu",
    icon: <PhoneOff size={18} />,
    color: "amber",
  },
  {
    value: "delay",
    label: "Pediu prazo extra",
    desc: "Precisa de alguns dias a mais",
    icon: <Calendar size={18} />,
    color: "amber",
  },
  {
    value: "dispute",
    label: "Disputa/contestação",
    desc: "Questionou a cobrança ou os valores",
    icon: <CircleAlert size={18} />,
    color: "amber",
  },
  {
    value: "renegotiate",
    label: "Quer renegociar",
    desc: "Quer alterar condições",
    icon: <Handshake size={18} />,
    color: "blue",
  },
  {
    value: "deceased",
    label: "Falecido",
    desc: "Foi informado o falecimento",
    icon: <HeartCrack size={18} />,
    color: "blue",
  },
  {
    value: "no_forecast",
    label: "Sem previsão",
    desc: "Não soube informar quando poderá pagar",
    icon: <PhoneOff size={18} />,
    color: "amber",
  },
  {
    value: "other",
    label: "Outro",
    desc: "Registrar outra situação",
    icon: <Ellipsis size={18} />,
    color: "blue",
  },
];

const VISIT_ONLY_OUTCOMES: OutcomeOption[] = [
  {
    value: "not_located",
    label: "Não localizado",
    desc: "Não foi localizado no endereço da visita",
    icon: <MapPinOff size={18} />,
    color: "gray",
  },
];

export function getPreventiveOutcomes(
  channel: "whatsapp" | "phone" | "visit" | null,
): OutcomeOption[] {
  return channel === "visit" ? [...OUTCOMES, ...VISIT_ONLY_OUTCOMES] : OUTCOMES;
}
