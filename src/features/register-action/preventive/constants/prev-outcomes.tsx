import { Calendar, CheckCircle2, Handshake, PhoneOff } from "lucide-react";
import type { OutcomeOption } from "@/features/register-action/components/OutcomeOptionList";

export const PREV_OUTCOMES: OutcomeOption[] = [
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
    value: "renegotiate",
    label: "Quer renegociar",
    desc: "Quer alterar condições",
    icon: <Handshake size={18} />,
    color: "blue",
  },
];
