import { describe, expect, it } from "vitest";
import { QuoteStatus } from "@/services/quotes/quotes.enums";
import {
  getQuoteListAction,
  getQuoteStatusPresentation,
  isQuoteClientReview,
  isQuoteInBackoffice,
} from "@/services/quotes/quotes.status";

describe("quote status presentation", () => {
  it("does not treat client_review as concluded", () => {
    const info = getQuoteStatusPresentation(QuoteStatus.CLIENT_REVIEW);
    expect(info.label).toBe("Revisão do cliente");
    expect(info.tone).toBe("warning");
    expect(info.label).not.toMatch(/concluíd/i);
    expect(isQuoteClientReview(QuoteStatus.CLIENT_REVIEW)).toBe(true);
    expect(isQuoteInBackoffice(QuoteStatus.CLIENT_REVIEW)).toBe(false);
    expect(getQuoteListAction(QuoteStatus.CLIENT_REVIEW)).toBe(
      "follow_client_review",
    );
  });

  it("keeps drafts in the portal wizard", () => {
    expect(getQuoteStatusPresentation(QuoteStatus.DRAFT).label).toBe(
      "Rascunho",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.DRAFT).tone).toBe("muted");
    expect(getQuoteListAction(QuoteStatus.DRAFT)).toBe("continue_draft");
    expect(isQuoteInBackoffice(QuoteStatus.DRAFT)).toBe(false);
  });

  it("uses a distinct color per lifecycle meaning", () => {
    expect(getQuoteStatusPresentation(QuoteStatus.KYC_ANALYSIS).tone).toBe(
      "muted",
    );
    expect(getQuoteStatusPresentation("pending").tone).toBe("warning");
    expect(getQuoteStatusPresentation("em_analise").tone).toBe("info");
    expect(getQuoteStatusPresentation("approved").tone).toBe("success");
    expect(getQuoteStatusPresentation("rejected").tone).toBe("destructive");
    expect(getQuoteStatusPresentation("failed").tone).toBe("destructive");
  });

  it("opens the backoffice after client review", () => {
    expect(getQuoteListAction(QuoteStatus.KYC_ANALYSIS)).toBe(
      "open_backoffice",
    );
    expect(isQuoteInBackoffice(QuoteStatus.KYC_ANALYSIS)).toBe(true);
    expect(getQuoteStatusPresentation(QuoteStatus.KYC_ANALYSIS).label).toBe(
      "Validação automática",
    );
    expect(getQuoteListAction("pending")).toBe("open_backoffice");
    expect(getQuoteListAction("approved")).toBe("open_backoffice");
  });
});
