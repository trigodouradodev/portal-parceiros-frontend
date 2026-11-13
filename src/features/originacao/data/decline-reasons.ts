import type { SelectOption } from "@/components/ui/select-option";
import { QuoteDeclineReason } from "@/services/quotes/quotes.enums";

/** Motivos oferecidos ao parceiro ao recusar um rascunho da Canal Digital. */
export const DECLINE_REASON_OPTIONS: SelectOption[] = [
  { value: QuoteDeclineReason.CLIENT_GAVE_UP, label: "Cliente desistiu" },
  {
    value: QuoteDeclineReason.NO_CONTACT,
    label: "Não consegui contato com o cliente",
  },
  { value: QuoteDeclineReason.OUT_OF_PROFILE, label: "Cliente fora do perfil" },
  { value: QuoteDeclineReason.DUPLICATE, label: "Proposta duplicada" },
  { value: QuoteDeclineReason.OTHER, label: "Outro motivo" },
];

export const DECLINE_NOTE_MAX_LENGTH = 500;
/** Tamanho mínimo da observação quando o motivo é "outro". */
export const DECLINE_OTHER_NOTE_MIN_LENGTH = 3;
