import type { PreventiveContactType } from "@/contexts/action/action-context";

export type FlowStep = "recipient" | "contact" | "outcome";

function getContactActionLabel(contactType: PreventiveContactType): string {
  if (contactType === "visit") return "Visita";
  if (contactType === "whatsapp") return "WhatsApp";
  return "Ligação";
}

export function getChargeFlowSteps(
  contactType: PreventiveContactType,
): [string, string, string] {
  const outcomeLabel =
    contactType === "visit" ? "Resultado da visita" : "Resultado";
  return ["Destinatário", getContactActionLabel(contactType), outcomeLabel];
}

export function getChargeStepTitle(
  step: FlowStep,
  contactType: PreventiveContactType,
): string {
  if (step === "recipient") return "Destinatário";
  if (contactType === "visit") return "Resultado da visita";
  if (step === "contact") return getContactActionLabel(contactType);
  return "Resultado do contato";
}
