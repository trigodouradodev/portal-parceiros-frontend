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
  return ["Destinatário", getContactActionLabel(contactType), "Resultado"];
}

export function getChargeStepTitle(
  step: FlowStep,
  contactType: PreventiveContactType,
): string {
  if (step === "recipient") return "Destinatário";
  if (step === "contact") return getContactActionLabel(contactType);
  return "Resultado do contato";
}
