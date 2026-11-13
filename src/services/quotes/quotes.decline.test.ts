import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  QuoteDeclineReason,
  QuoteStatus,
} from "@/services/quotes/quotes.enums";
import { quotesService } from "@/services/quotes/quotes.service";

const { put } = vi.hoisted(() => ({ put: vi.fn() }));

vi.mock("@/lib/api/axios", () => ({
  api: { put },
  default: { put },
}));

beforeEach(() => {
  put.mockReset();
});

describe("quotesService.declineDraft", () => {
  it("envia o motivo e a observação para PUT /quotes/draft/:id/decline", async () => {
    put.mockResolvedValue({
      data: { id: "quote-1", status: QuoteStatus.DECLINED, updatedAt: "x" },
    });

    const result = await quotesService.declineDraft("quote-1", {
      reason: QuoteDeclineReason.OTHER,
      note: "Mudou de cidade",
    });

    expect(put).toHaveBeenCalledWith("/quotes/draft/quote-1/decline", {
      reason: "other",
      note: "Mudou de cidade",
    });
    expect(result.status).toBe(QuoteStatus.DECLINED);
  });

  it("propaga o erro da API para quem chamou", async () => {
    put.mockRejectedValue(new Error("conflito"));

    await expect(
      quotesService.declineDraft("quote-1", {
        reason: QuoteDeclineReason.NO_RESPONSE,
      }),
    ).rejects.toThrow("conflito");
  });
});
