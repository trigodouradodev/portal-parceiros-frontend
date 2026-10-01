import { describe, expect, it } from "vitest";
import {
  ALL_QUOTE_STATUSES,
  QUOTE_LIST_STATUS_OPTIONS,
  buildQuotesListQuery,
  isQuotesFilterActive,
} from "@/features/originacao/data/quotes-list-query";
import { QuoteStatus } from "@/services/quotes/quotes.enums";

describe("QUOTE_LIST_STATUS_OPTIONS", () => {
  it("starts with Todas, followed only by statuses that occur in practice", () => {
    expect(QUOTE_LIST_STATUS_OPTIONS[0]).toEqual({
      value: ALL_QUOTE_STATUSES,
      label: "Todas",
    });

    const values = QUOTE_LIST_STATUS_OPTIONS.map((option) => option.value);
    expect(values).toContain(QuoteStatus.DRAFT);
    expect(values).toContain(QuoteStatus.APPROVED);
    expect(values).toContain(QuoteStatus.REJECTED);
    expect(values).not.toContain(QuoteStatus.KYC_ANALYSIS);
    expect(values).not.toContain(QuoteStatus.IN_ANALYSIS);
    expect(values).not.toContain(QuoteStatus.PRE_APPROVED);
    expect(values).not.toContain(QuoteStatus.AUTO_REJECTED);
  });
});

describe("buildQuotesListQuery", () => {
  it("always sets page and limit, omitting search and status when empty", () => {
    expect(buildQuotesListQuery("")).toEqual({ page: 1, limit: 30 });
  });

  it("includes search, trimmed, when given", () => {
    expect(buildQuotesListQuery("  maria  ")).toEqual({
      page: 1,
      limit: 30,
      search: "maria",
    });
  });

  it("includes status when it is not the Todas sentinel", () => {
    expect(buildQuotesListQuery("", 1, QuoteStatus.APPROVED)).toEqual({
      page: 1,
      limit: 30,
      status: QuoteStatus.APPROVED,
    });
  });

  it("omits status when it is the Todas sentinel", () => {
    expect(buildQuotesListQuery("", 1, ALL_QUOTE_STATUSES)).toEqual({
      page: 1,
      limit: 30,
    });
  });

  it("respects the page argument", () => {
    expect(buildQuotesListQuery("", 3)).toEqual({ page: 3, limit: 30 });
  });
});

describe("isQuotesFilterActive", () => {
  it("is inactive when neither search nor status is set", () => {
    expect(isQuotesFilterActive({ page: 1, limit: 30 })).toBe(false);
  });

  it("is active when search is set", () => {
    expect(isQuotesFilterActive({ page: 1, limit: 30, search: "maria" })).toBe(
      true,
    );
  });

  it("is active when status is set", () => {
    expect(
      isQuotesFilterActive({
        page: 1,
        limit: 30,
        status: QuoteStatus.APPROVED,
      }),
    ).toBe(true);
  });
});
