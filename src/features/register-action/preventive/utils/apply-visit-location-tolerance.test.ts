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
  it("confirma exact dentro do raio base", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({ distanceMeters: 80, withinRadius: true }),
    );

    expect(decision.confirmationLevel).toBe("exact");
    expect(decision.withinRadius).toBe(true);
    expect(decision.effectiveRadiusMeters).toBe(100);
  });

  it("amplia o raio exato com accuracy (teto 100 m)", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({ distanceMeters: 150, withinRadius: false }),
      60,
    );

    expect(decision.confirmationLevel).toBe("exact");
    expect(decision.effectiveRadiusMeters).toBe(160);
  });

  it("confirma por proximidade entre o raio efetivo e 300 m", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({ distanceMeters: 220, withinRadius: false }),
    );

    expect(decision.confirmationLevel).toBe("proximity");
    expect(decision.withinRadius).toBe(true);
  });

  it("não confirma quando o geocoding do endereço não é confiável", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({
        distanceMeters: 10,
        withinRadius: true,
        addressLikelyWrong: true,
        partialMatch: true,
        locationType: "GEOMETRIC_CENTER",
      }),
    );

    expect(decision.confirmationLevel).toBeNull();
    expect(decision.withinRadius).toBe(false);
  });

  it("rejeita além da faixa de proximidade", () => {
    const decision = applyVisitLocationTolerance(
      apiResult({ distanceMeters: 400, withinRadius: false }),
    );

    expect(decision.confirmationLevel).toBeNull();
    expect(decision.withinRadius).toBe(false);
  });
});
