import { describe, expect, it } from "vitest";
import type { LocationCheckResult } from "@/services/location-check/location-check.types";
import { applyVisitLocationTolerance } from "./apply-visit-location-tolerance";

function apiResult(
  overrides: Partial<LocationCheckResult> = {},
): LocationCheckResult {
  return {
    withinRadius: false,
    distanceMeters: 150,
    radiusMeters: 100,
    effectiveRadiusMeters: 100,
    proximityRadiusMeters: 300,
    confirmationLevel: null,
    registeredCoordinates: { latitude: -23.5, longitude: -46.6 },
    providedCoordinates: { latitude: -23.501, longitude: -46.6 },
    matchedAddress: "Rua X",
    locationType: "ROOFTOP",
    partialMatch: false,
    addressLikelyWrong: false,
    ...overrides,
  };
}

describe("applyVisitLocationTolerance", () => {
  it("mantém a confirmação exata devolvida pela API", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({
        distanceMeters: 80,
        withinRadius: true,
        confirmationLevel: "exact",
      }),
    );

    expect(decision.confirmationLevel).toBe("exact");
    expect(decision.withinRadius).toBe(true);
    expect(decision.effectiveRadiusMeters).toBe(100);
  });

  it("mantém a confirmação por proximidade devolvida pela API", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({
        distanceMeters: 220,
        withinRadius: true,
        confirmationLevel: "proximity",
        effectiveRadiusMeters: 160,
      }),
    );

    expect(decision.confirmationLevel).toBe("proximity");
    expect(decision.withinRadius).toBe(true);
    expect(decision.effectiveRadiusMeters).toBe(160);
    expect(decision.proximityRadiusMeters).toBe(300);
  });

  it("não confirma quando o geocoding do endereço não é confiável", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({
        distanceMeters: 10,
        withinRadius: true,
        confirmationLevel: "exact",
        addressLikelyWrong: true,
        partialMatch: true,
        locationType: "GEOMETRIC_CENTER",
      }),
    );

    expect(decision.confirmationLevel).toBeNull();
    expect(decision.withinRadius).toBe(false);
  });

  it("mantém a recusa da API fora da faixa", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({
        distanceMeters: 400,
        withinRadius: false,
        confirmationLevel: null,
      }),
    );

    expect(decision.confirmationLevel).toBeNull();
    expect(decision.withinRadius).toBe(false);
  });
});
