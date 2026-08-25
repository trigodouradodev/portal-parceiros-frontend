/**
 * Types matching portal-parceiros-backend/src/location-check/
 */

import type { FollowUpParty } from "@/services/followup/followup.types";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface VerifyLocationPayload {
  contractId: string;
  installmentNumber: number;
  party?: FollowUpParty;
  latitude: number;
  longitude: number;
}

export interface LocationCheckResult {
  withinRadius: boolean;
  distanceMeters: number;
  radiusMeters: number;
  registeredCoordinates: Coordinates;
  providedCoordinates: Coordinates;
  matchedAddress: string;
  locationType: string;
  partialMatch: boolean;
  /**
   * true quando o endereço formatado não menciona a cidade cadastrada —
   * sinal de que o geocoding pode ter casado com uma via de mesmo nome em
   * outro município (AUREA-352). Diferente de partialMatch: não é só
   * impreciso, é provavelmente errado — a distância não é confiável.
   */
  addressLikelyWrong: boolean;
}
