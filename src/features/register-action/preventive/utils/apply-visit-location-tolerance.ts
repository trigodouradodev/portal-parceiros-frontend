import type { LocationCheckResult } from "@/services/location-check/location-check.types";

/** Faixa intermediária ("confirmado por proximidade"), em metros. */
export const VISIT_PROXIMITY_RADIUS_METERS = 300;

/**
 * Teto do bônus de accuracy no raio exato — evita GPS indoor com accuracy
 * de centenas de metros liberar a checagem em qualquer lugar.
 */
export const MAX_ACCURACY_BONUS_METERS = 100;

export type LocationConfirmationLevel = "exact" | "proximity";

/** Resultado da API + política local de tolerância (accuracy e proximidade). */
export interface VisitLocationDecision extends LocationCheckResult {
  effectiveRadiusMeters: number;
  proximityRadiusMeters: number;
  confirmationLevel: LocationConfirmationLevel | null;
}

/**
 * Reavalia o resultado do location-check no cliente: amplia o raio exato com
 * a accuracy do GPS e libera a faixa intermediária com selo de proximidade.
 * Não altera o contrato da API.
 */
function accuracyBonusOf(accuracyMeters?: number): number {
  return Math.min(Math.max(accuracyMeters ?? 0, 0), MAX_ACCURACY_BONUS_METERS);
}

export function applyVisitLocationTolerance(
  apiResult: LocationCheckResult,
  accuracyMeters?: number,
): VisitLocationDecision {
  const accuracyBonus = accuracyBonusOf(accuracyMeters);
  const effectiveRadiusMeters = apiResult.radiusMeters + accuracyBonus;
  const proximityRadiusMeters = Math.max(
    VISIT_PROXIMITY_RADIUS_METERS,
    effectiveRadiusMeters,
  );

  if (apiResult.addressLikelyWrong) {
    return {
      ...apiResult,
      withinRadius: false,
      effectiveRadiusMeters,
      proximityRadiusMeters,
      confirmationLevel: null,
    };
  }

  let confirmationLevel: LocationConfirmationLevel | null = null;
  if (apiResult.distanceMeters <= effectiveRadiusMeters) {
    confirmationLevel = "exact";
  } else if (apiResult.distanceMeters <= proximityRadiusMeters) {
    confirmationLevel = "proximity";
  }

  return {
    ...apiResult,
    withinRadius: confirmationLevel !== null,
    effectiveRadiusMeters,
    proximityRadiusMeters,
    confirmationLevel,
  };
}
