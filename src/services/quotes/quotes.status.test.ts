import { describe, expect, it } from "vitest";
import { QuoteStatus } from "@/services/quotes/quotes.enums";
import {
  QuoteListAction,
  getQuoteListAction,
  getQuoteStatusPresentation,
  isQuoteClientReview,
  isQuoteInBackoffice,
  opensQuoteInBackoffice,
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
      QuoteListAction.FOLLOW_CLIENT_REVIEW,
    );
    expect(
      opensQuoteInBackoffice(getQuoteListAction(QuoteStatus.CLIENT_REVIEW)),
    ).toBe(true);
  });

  it("keeps drafts in the portal wizard", () => {
    expect(getQuoteStatusPresentation(QuoteStatus.DRAFT).label).toBe(
      "Rascunho",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.DRAFT).tone).toBe("muted");
    expect(getQuoteListAction(QuoteStatus.DRAFT)).toBe(
      QuoteListAction.CONTINUE_DRAFT,
    );
    expect(opensQuoteInBackoffice(getQuoteListAction(QuoteStatus.DRAFT))).toBe(
      false,
    );
    expect(isQuoteInBackoffice(QuoteStatus.DRAFT)).toBe(false);
  });

  it("uses a distinct color per lifecycle meaning", () => {
    expect(getQuoteStatusPresentation(QuoteStatus.KYC_ANALYSIS).tone).toBe(
      "muted",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.PENDING).tone).toBe(
      "warning",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.IN_ANALYSIS).tone).toBe(
      "info",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.APPROVED).tone).toBe(
      "success",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.REJECTED).tone).toBe(
      "destructive",
    );
    expect(getQuoteStatusPresentation(QuoteStatus.FAILED).tone).toBe(
      "destructive",
    );
  });

  it("opens the backoffice after client review", () => {
    expect(getQuoteListAction(QuoteStatus.KYC_ANALYSIS)).toBe(
      QuoteListAction.OPEN_BACKOFFICE,
    );
    expect(isQuoteInBackoffice(QuoteStatus.KYC_ANALYSIS)).toBe(true);
    expect(
      opensQuoteInBackoffice(getQuoteListAction(QuoteStatus.KYC_ANALYSIS)),
    ).toBe(true);
    expect(getQuoteStatusPresentation(QuoteStatus.KYC_ANALYSIS).label).toBe(
      "Validação automática",
    );
    expect(getQuoteListAction(QuoteStatus.PENDING)).toBe(
      QuoteListAction.OPEN_BACKOFFICE,
    );
    expect(getQuoteListAction(QuoteStatus.APPROVED)).toBe(
      QuoteListAction.OPEN_BACKOFFICE,
    );
  });

  it("maps every QuoteStatus through the enum", () => {
    for (const status of Object.values(QuoteStatus)) {
      const info = getQuoteStatusPresentation(status);
      expect(info.label, status).toBeTruthy();
      expect(info.label, status).not.toBe(status);
    }
  });
});
