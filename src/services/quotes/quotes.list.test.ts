import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { quotesService } from "@/services/quotes/quotes.service";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/api/axios", () => ({
  api: { get },
  default: { get },
}));

beforeEach(() => {
  get.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("quotesService list/detail", () => {
  it("lists quotes with pagination query params", async () => {
    const page = {
      items: [],
      pagination: {
        page: 1,
        limit: 30,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    };
    get.mockResolvedValue({ data: page });

    await expect(
      quotesService.list({ page: 2, limit: 10, search: "Maria" }),
    ).resolves.toEqual(page);

    expect(get).toHaveBeenCalledWith("/quotes", {
      params: { page: 2, limit: 10, search: "Maria" },
    });
  });

  it("loads quote detail by id", async () => {
    const detail = { id: "quote-1" };
    get.mockResolvedValue({ data: detail });

    await expect(quotesService.getById("quote-1")).resolves.toEqual(detail);
    expect(get).toHaveBeenCalledWith("/quotes/quote-1");
  });
});
