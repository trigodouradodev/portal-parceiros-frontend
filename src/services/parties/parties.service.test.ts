import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PARTY_LOOKUP_TIMEOUT_MS,
  partiesService,
} from "@/services/parties/parties.service";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/api/axios", () => ({
  api: { get },
  default: { get },
}));

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { party: null } });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("partiesService.findFormDataByCpf", () => {
  it("GETs /parties/by-cpf and returns the party", async () => {
    const party = { name: "Maria", document: "52998224725" };
    get.mockResolvedValue({ data: { party } });

    await expect(
      partiesService.findFormDataByCpf("52998224725"),
    ).resolves.toEqual(party);

    expect(get).toHaveBeenCalledWith(
      "/parties/by-cpf/52998224725",
      expect.objectContaining({ timeout: PARTY_LOOKUP_TIMEOUT_MS }),
    );
  });

  it("returns null when the CPF is not registered", async () => {
    await expect(
      partiesService.findFormDataByCpf("52998224725"),
    ).resolves.toBeNull();
  });

  it("propagates HTTP errors", async () => {
    get.mockRejectedValue(
      new AxiosError("error", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 400,
        data: {},
        statusText: "Bad Request",
        headers: {},
        config: { headers: {} as never },
      }),
    );

    await expect(
      partiesService.findFormDataByCpf("11111111111"),
    ).rejects.toBeInstanceOf(AxiosError);
  });
});
