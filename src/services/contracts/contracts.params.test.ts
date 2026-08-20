import { describe, expect, it } from "vitest";
import { buildContractsParams } from "@/services/contracts/contracts.service";

describe("buildContractsParams", () => {
  it("always sends page and limit", () => {
    expect(buildContractsParams({})).toEqual({ page: 1, limit: 30 });
  });

  it("sends products as CSV and optional booleans only when true", () => {
    expect(
      buildContractsParams({
        page: 2,
        limit: 10,
        search: "  ana  ",
        products: ["a", "b"],
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        onlyActive: true,
        onlyDelinquency: true,
        onlyRenegotiated: false,
        onlyDueToday: true,
        onlyUpcomingRenewal: true,
      }),
    ).toEqual({
      page: 2,
      limit: 10,
      search: "ana",
      products: "a,b",
      startDate: "2026-01-01",
      endDate: "2026-02-01",
        onlyActive: true,
        onlyDelinquency: true,
        onlyDueToday: true,
        onlyUpcomingRenewal: true,
    });
  });
});
