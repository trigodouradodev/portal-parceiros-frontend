import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuoteAttachmentType } from "@/services/quotes/quotes.enums";
import { quotesService } from "@/services/quotes/quotes.service";

const { post, get, deleteFn, patch } = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  deleteFn: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("@/lib/api/axios", () => ({
  api: { post, get, delete: deleteFn, patch },
  default: { post, get, delete: deleteFn, patch },
}));

beforeEach(() => {
  post.mockReset();
  get.mockReset();
  deleteFn.mockReset();
  patch.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("quotesService documentation", () => {
  it("uploads multipart attachment without forcing JSON content-type", async () => {
    const snapshot = {
      id: "att-1",
      attachmentType: QuoteAttachmentType.IDENTIFICATION_DOCUMENT,
      filename: "rg.pdf",
      mimetype: "application/pdf",
      size: 12,
      createdAt: "2026-09-03T12:00:00.000Z",
    };
    post.mockResolvedValue({ data: snapshot });
    const file = new File(["%PDF-1.4"], "rg.pdf", {
      type: "application/pdf",
    });

    await expect(
      quotesService.uploadAttachment("quote-1", {
        attachmentType: QuoteAttachmentType.IDENTIFICATION_DOCUMENT,
        file,
      }),
    ).resolves.toEqual(snapshot);

    expect(post).toHaveBeenCalledWith(
      "/quotes/draft/quote-1/attachments",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
    const body = post.mock.calls[0]?.[1] as FormData;
    expect(body.get("attachmentType")).toBe(
      QuoteAttachmentType.IDENTIFICATION_DOCUMENT,
    );
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("completes documentation via PATCH", async () => {
    patch.mockResolvedValue({
      data: {
        id: "quote-1",
        status: "draft",
        step: "documentation",
        completedAt: "2026-09-03T12:00:00.000Z",
        updatedAt: "2026-09-03T12:00:00.000Z",
        identificationDocuments: [],
        proofOfResidence: [],
        activityPhotos: [],
        proofOfIncome: [],
      },
    });

    await quotesService.completeDocumentation("quote-1");
    expect(patch).toHaveBeenCalledWith("/quotes/draft/quote-1/documentation");
  });
});
