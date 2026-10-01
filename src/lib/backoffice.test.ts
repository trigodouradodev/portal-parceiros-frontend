import { afterEach, describe, expect, it, vi } from "vitest";
import { getBackofficeQuoteUrl, getBackofficeUrl } from "@/lib/backoffice";

describe("getBackofficeUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds list and create URLs from VITE_BACKOFFICE_URL", () => {
    vi.stubEnv("VITE_BACKOFFICE_URL", "https://backoffice.example.com");
    expect(getBackofficeUrl("/quotes")).toBe(
      "https://backoffice.example.com/quotes",
    );
    expect(getBackofficeUrl("/quotes/create/register")).toBe(
      "https://backoffice.example.com/quotes/create/register",
    );
  });

  it("builds the quote detail URL used after client review", () => {
    vi.stubEnv("VITE_BACKOFFICE_URL", "https://backoffice.example.com/");
    expect(getBackofficeQuoteUrl("quote-1")).toBe(
      "https://backoffice.example.com/credit-analysis/quotes/quote-1",
    );
  });
});
