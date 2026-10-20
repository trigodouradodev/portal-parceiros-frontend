/** Códigos estáveis do 403 devolvido pelo backend (AUREA-623 e AUREA-624). */
export const PartnerRestrictionCode = {
  ACCESS_RESTRICTED: "PARTNER_ACCESS_RESTRICTED",
  ORIGINATION_RESTRICTED: "PARTNER_ORIGINATION_RESTRICTED",
} as const;
export type PartnerRestrictionCode =
  (typeof PartnerRestrictionCode)[keyof typeof PartnerRestrictionCode];

export const PARTNER_ACCESS_RESTRICTED_MESSAGE =
  "Acesso bloqueado. Fale com seu gerente.";
export const PARTNER_ORIGINATION_RESTRICTED_MESSAGE =
  "Você está com a originação restrita. Fale com seu gerente.";

const LOGOUT_REASON_KEY = "auth_logout_reason";

/**
 * Guarda o motivo do encerramento da sessão para a tela de login explicar o
 * que houve (a navegação para /login fica a cargo do Router). Só o bloqueio
 * por restrição de acesso é registrado.
 */
export function rememberAccessRestrictedLogout(): void {
  try {
    sessionStorage.setItem(
      LOGOUT_REASON_KEY,
      PartnerRestrictionCode.ACCESS_RESTRICTED,
    );
  } catch {
    // sessionStorage indisponível (modo privado etc.): a sessão cai do mesmo
    // jeito, só sem a explicação na tela de login.
  }
}

/** Mensagem a mostrar no login quando a sessão caiu por restrição de acesso. */
export function readLogoutReasonMessage(): string | null {
  try {
    return sessionStorage.getItem(LOGOUT_REASON_KEY) ===
      PartnerRestrictionCode.ACCESS_RESTRICTED
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
