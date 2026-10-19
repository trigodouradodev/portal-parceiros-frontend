import { isAxiosError } from "axios";

/** Códigos estáveis do 403 devolvido pelo backend (AUREA-623 e AUREA-624). */
export const PARTNER_ACCESS_RESTRICTED = "PARTNER_ACCESS_RESTRICTED";
export const PARTNER_ORIGINATION_RESTRICTED = "PARTNER_ORIGINATION_RESTRICTED";

export const PARTNER_ACCESS_RESTRICTED_MESSAGE =
  "Acesso bloqueado. Fale com seu gerente.";
export const PARTNER_ORIGINATION_RESTRICTED_MESSAGE =
  "Você está com a originação restrita. Fale com seu gerente.";

const LOGOUT_REASON_KEY = "auth_logout_reason";

/** `code` do corpo de erro da API, quando houver. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Guarda o motivo do encerramento da sessão para a tela de login explicar o
 * que houve (a navegação para /login fica a cargo do Router). Só o bloqueio
 * por restrição de acesso é registrado.
 */
export function rememberAccessRestrictedLogout(): void {
  try {
    sessionStorage.setItem(LOGOUT_REASON_KEY, PARTNER_ACCESS_RESTRICTED);
  } catch {
    // sessionStorage indisponível (modo privado etc.): a sessão cai do mesmo
    // jeito, só sem a explicação na tela de login.
  }
}

/** Mensagem a mostrar no login quando a sessão caiu por restrição de acesso. */
export function readLogoutReasonMessage(): string | null {
  try {
    return sessionStorage.getItem(LOGOUT_REASON_KEY) ===
      PARTNER_ACCESS_RESTRICTED
      ? PARTNER_ACCESS_RESTRICTED_MESSAGE
      : null;
  } catch {
    return null;
  }
}

export function clearLogoutReason(): void {
  try {
    sessionStorage.removeItem(LOGOUT_REASON_KEY);
  } catch {
    // ver rememberAccessRestrictedLogout
  }
}
