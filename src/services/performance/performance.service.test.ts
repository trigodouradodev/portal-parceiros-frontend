import { api } from "@/lib/api/axios";
import { performanceService } from "./performance.service";
import {
  testPerformanceMonths,
  testPerformanceData,
} from "@/test/fixtures/performance";

vi.mock("@/lib/api/axios", () => ({ api: { get: vi.fn() } }));

describe("performance view endpoints", () => {
  it("requests the authenticated partner's history and forwards cancellation", async () => {
    const signal = new AbortController().signal;
    vi.mocked(api.get).mockResolvedValueOnce({ data: testPerformanceMonths });
    expect(await performanceService.getMonths(signal)).toEqual(
      testPerformanceMonths,
    );
    expect(api.get).toHaveBeenLastCalledWith("/performance/months", { signal });
  });
  it("requests only the selected month without passing a partner id", async () => {
    const signal = new AbortController().signal;
    vi.mocked(api.get).mockResolvedValueOnce({ data: testPerformanceData });
    expect(await performanceService.getPerformance("2026-09", signal)).toEqual(
      testPerformanceData,
    );
    expect(api.get).toHaveBeenLastCalledWith("/performance", {
      params: { month: "2026-09" },
      signal,
    });
  });
});

it("sends the selected partner to both consultation endpoints", async () => {
  const partnerId = "f630bd84-1425-423a-a533-5e5139abb9d5";
  const signal = new AbortController().signal;
  vi.mocked(api.get).mockResolvedValue({ data: testPerformanceMonths });
  await performanceService.getMonths(signal, partnerId);
  expect(api.get).toHaveBeenLastCalledWith("/performance/months", {
    signal,
    params: { partnerId },
  });
  await performanceService.getPerformance("2026-09", signal, partnerId);
  expect(api.get).toHaveBeenLastCalledWith("/performance", {
    signal,
    params: { month: "2026-09", partnerId },
  });
});
