import type { LocationCheckResult } from "@/services/location-check/location-check.types";

/** Resultado da API depois de recusar pin de geocoding não confiável. */
export type VisitLocationDecision = LocationCheckResult;

/**
 * A API já devolve o nível (exato, proximidade ou fora). Aqui só impede
 * confirmação automática quando o ponto do endereço não é confiável.
 */
export function applyVisitLocationTolerance(
  apiResult: LocationCheckResult,
): VisitLocationDecision {
  if (!apiResult.addressLikelyWrong) return apiResult;

  return {
    ...apiResult,
    withinRadius: false,
    confirmationLevel: null,
  };
}
