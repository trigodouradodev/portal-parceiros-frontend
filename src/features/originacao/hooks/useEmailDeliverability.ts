import { useEffect, useRef, useState } from "react";
import {
  emailValidationService,
  type EmailValidationResult,
} from "@/services/email-validation/email-validation.service";

const DEBOUNCE_MS = 700;
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailDeliverabilityStatus = {
  UNCHECKED: "unchecked", // e-mail vazio ou formato inválido
  CHECKING: "checking", // verificação em andamento
  OK: "ok", // verificado e aceitável
  BLOCKED: "blocked", // verificado e reprovado pela ZeroBounce
  UNAVAILABLE: "unavailable", // não foi possível concluir (fail-open)
} as const;
export type EmailDeliverabilityStatus =
  (typeof EmailDeliverabilityStatus)[keyof typeof EmailDeliverabilityStatus];

interface EmailDeliverabilityState {
  status: EmailDeliverabilityStatus;
  result: EmailValidationResult | null;
}

interface ResolvedCheck {
  email: string;
  status: EmailDeliverabilityStatus;
  result: EmailValidationResult | null;
}

/**
 * Verifica a entregabilidade de um e-mail via ZeroBounce (debounced), só
 * quando o e-mail já tem formato válido. Espelha o hook homônimo do
 * Backoffice (trigo-connector-web), com uma diferença deliberada de
 * produto: aqui o resultado NUNCA bloqueia o avanço do wizard por conta
 * própria — quem chama decide o que fazer com `status === "blocked"`
 * (ver `PropostaPage`). `unavailable` (falha na integração) nunca é
 * tratado como reprovação.
 *
 * `checking` é derivado no render (email atual != email do último
 * resultado resolvido), não via `setState` síncrono dentro do efeito —
 * `setState` só acontece dentro do callback assíncrono do debounce, mesmo
 * padrão já usado em `SimulacaoList`/`ProposalList` pra busca debounced.
 */
export function useEmailDeliverability(
  email: string | undefined,
): EmailDeliverabilityState {
  const [resolved, setResolved] = useState<ResolvedCheck | null>(null);
  const requestIdRef = useRef(0);
  const isValidFormat = Boolean(email) && EMAIL_FORMAT_REGEX.test(email!);

  useEffect(() => {
    if (!email || !EMAIL_FORMAT_REGEX.test(email)) return;

    const currentRequestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await emailValidationService.validate(email);
        if (requestIdRef.current !== currentRequestId) return;

        const status = !result.checked
          ? EmailDeliverabilityStatus.UNAVAILABLE
          : result.isAcceptable
            ? EmailDeliverabilityStatus.OK
            : EmailDeliverabilityStatus.BLOCKED;
        setResolved({ email, status, result });
      } catch {
        if (requestIdRef.current !== currentRequestId) return;
        setResolved({
          email,
          status: EmailDeliverabilityStatus.UNAVAILABLE,
          result: null,
        });
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [email]);

  if (!isValidFormat) {
    return { status: EmailDeliverabilityStatus.UNCHECKED, result: null };
  }
  if (!resolved || resolved.email !== email) {
    return { status: EmailDeliverabilityStatus.CHECKING, result: null };
  }
  return { status: resolved.status, result: resolved.result };
}
