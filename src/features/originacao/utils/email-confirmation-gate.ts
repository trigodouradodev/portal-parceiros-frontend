import { EmailDeliverabilityStatus } from "@/features/originacao/hooks/useEmailDeliverability";

export type BlockedEmailField = "registration.email" | "guarantor.email";

/**
 * Decide se o avanço do wizard deve ser interrompido por causa de um e-mail
 * reprovado pela ZeroBounce — extraída de `PropostaPage` pra ser testável
 * sem precisar montar a página inteira (que depende de ~9 hooks de
 * mutation). Só o step com o campo de e-mail correspondente é checado;
 * `checking`/`unavailable`/`ok`/`unchecked` nunca bloqueiam nada aqui — o
 * único estado que interrompe é `blocked`, e só no step certo.
 */
export function getBlockedEmailField(
  step: number,
  registrationEmailStatus: EmailDeliverabilityStatus,
  guarantorEmailStatus: EmailDeliverabilityStatus,
): BlockedEmailField | null {
  if (
    step === 0 &&
    registrationEmailStatus === EmailDeliverabilityStatus.BLOCKED
  ) {
    return "registration.email";
  }
  if (
    step === 2 &&
    guarantorEmailStatus === EmailDeliverabilityStatus.BLOCKED
  ) {
    return "guarantor.email";
  }
  return null;
}
