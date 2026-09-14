import { AxiosError, CanceledError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CepLookupError } from "@/services/cep/cep-lookup-error";
import { CEP_LOOKUP_TIMEOUT_MS, cepService } from "@/services/cep/cep.service";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/api/axios", () => ({
  api: { get },
  default: { get },
}));

const POSTAL_CODE_OK = {
  zipCode: "63031130",
  streetName: "Rua Artesão Manoel Barros",
  streetDistrict: "Tiradentes",
  city: "Juazeiro do Norte",
  state: "CE",
};

function axiosError(status: number) {
  return new AxiosError("error", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: {},
    statusText: "Error",
    headers: {},
    config: { headers: {} as never },
  });
}

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: POSTAL_CODE_OK });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("cepService.lookup", () => {
  it("GETs /locations/postal-code with digits and maps the address", async () => {
    await expect(cepService.lookup("63031-130")).resolves.toEqual({
      zipCode: "63031-130",
      street: "Rua Artesão Manoel Barros",
      neighborhood: "Tiradentes",
      city: "Juazeiro do Norte",
      state: "CE",
    });

    expect(get).toHaveBeenCalledWith(
      "/locations/postal-code/63031130",
      expect.objectContaining({ timeout: CEP_LOOKUP_TIMEOUT_MS }),
    );
  });

  it("does not call the API when the CEP is incomplete", async () => {
    await expect(cepService.lookup("63031")).rejects.toEqual(
      expect.objectContaining({ code: "invalid" }),
    );
    expect(get).not.toHaveBeenCalled();
  });

  it("treats HTTP 404 as not found", async () => {
    get.mockRejectedValue(axiosError(404));

    await expect(cepService.lookup("00000000")).rejects.toEqual(
      new CepLookupError("CEP não encontrado.", "not_found"),
    );
  });

  it("treats axios timeout as lookup timeout", async () => {
    const timeout = new AxiosError("timeout", "ECONNABORTED");
    get.mockRejectedValue(timeout);

    await expect(cepService.lookup("63031130")).rejects.toMatchObject({
      code: "timeout",
    });
  });

  it("propagates caller abort instead of mapping it to timeout", async () => {
    const controller = new AbortController();
    get.mockImplementation((_url, config: { signal?: AbortSignal }) => {
      return new Promise((_resolve, reject) => {
        config.signal?.addEventListener("abort", () => {
          reject(new CanceledError());
        });
      });
    });

    const pending = cepService.lookup("63031130", controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
