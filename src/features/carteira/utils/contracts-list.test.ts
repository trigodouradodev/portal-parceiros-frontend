import { describe, expect, it } from "vitest";
import {
  ALL_PRODUCTS,
  applyDebouncedSearch,
  buildContractsListQuery,
  buildInitialFilters,
  EMPTY_CONTRACTS_FILTERS,
} from "./contracts-list";

describe("buildInitialFilters", () => {
  it("starts empty without drill-down filters", () => {
    expect(buildInitialFilters()).toEqual(EMPTY_CONTRACTS_FILTERS);
    expect(buildInitialFilters({})).toEqual(EMPTY_CONTRACTS_FILTERS);
  });

  it("applies RN03 pre-filters from KPI drill-down", () => {
    expect(buildInitialFilters({ onlyActive: true })).toMatchObject({
      onlyActive: true,
      onlyDelinquency: false,
      onlyRenegotiated: false,
      page: 1,
    });
    expect(buildInitialFilters({ onlyDelinquency: true })).toMatchObject({
      onlyActive: false,
      onlyDelinquency: true,
      onlyRenegotiated: false,
      page: 1,
    });
    expect(buildInitialFilters({ onlyRenegotiated: true })).toMatchObject({
      onlyActive: false,
      onlyDelinquency: false,
      onlyRenegotiated: true,
    });
  });
});

describe("applyDebouncedSearch", () => {
  it("returns null when search is unchanged", () => {
    const prev = { ...EMPTY_CONTRACTS_FILTERS, search: "ana", page: 2 };
    expect(applyDebouncedSearch(prev, "ana")).toBeNull();
  });

  it("updates search and resets page", () => {
    const prev = { ...EMPTY_CONTRACTS_FILTERS, search: "", page: 3 };
    expect(applyDebouncedSearch(prev, "ct-1")).toEqual({
      ...prev,
      search: "ct-1",
      page: 1,
    });
  });
});

describe("buildContractsListQuery", () => {
  it("omits empty optional filters", () => {
    expect(buildContractsListQuery(EMPTY_CONTRACTS_FILTERS)).toEqual({
      page: 1,
      limit: 30,
      search: undefined,
      products: undefined,
      startDate: undefined,
      endDate: undefined,
      onlyActive: undefined,
      onlyDelinquency: undefined,
      onlyRenegotiated: undefined,
      onlyDueToday: undefined,
      onlyUpcomingRenewal: undefined,
    });
  });

  it("maps product and flags for the API", () => {
    expect(
      buildContractsListQuery({
        ...EMPTY_CONTRACTS_FILTERS,
        productId: "prod-1",
        search: "joão",
        onlyActive: true,
        onlyDelinquency: true,
        onlyDueToday: true,
        onlyUpcomingRenewal: true,
        page: 2,
      }),
    ).toEqual({
      page: 2,
      limit: 30,
      search: "joão",
      products: ["prod-1"],
      startDate: undefined,
      endDate: undefined,
      onlyActive: true,
      onlyDelinquency: true,
      onlyRenegotiated: undefined,
      onlyDueToday: true,
      onlyUpcomingRenewal: true,
    });
    expect(ALL_PRODUCTS).toBe("TODOS");
  });
});
