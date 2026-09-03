import { describe, expect, it } from "vitest";
import { roundGeoCoordinate } from "@/services/locations/geo-coords";

describe("roundGeoCoordinate", () => {
  it("limits coordinates to 8 decimal places for the API DTOs", () => {
    expect(roundGeoCoordinate(-7.237684265483068)).toBe(-7.23768427);
    expect(roundGeoCoordinate(-39.29954049920408)).toBe(-39.2995405);
  });

  it("keeps already short values", () => {
    expect(roundGeoCoordinate(-23.55052)).toBe(-23.55052);
  });
});
