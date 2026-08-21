import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CepLookupError } from "@/services/cep/cep-lookup-error";
import { CEP_LOOKUP_TIMEOUT_MS, cepService } from "@/services/cep/cep.service";

const VIA_CEP_OK = {
  cep: "63031-130",
  logradouro: "Rua Artesão Manoel Barros",
  complemento: "",
  bairro: "Tiradentes",
  localidade: "Juazeiro do Norte",
  uf: "CE",
};

function mockFetch(impl: typeof fetch) {
  vi.stubGlobal("fetch", impl);
}

function abortableHang(): typeof fetch {
  return (_url, init) =>
    new Promise((_, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(VIA_CEP_OK),
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("cepService.lookup", () => {
  it("GETs ViaCEP with digits only and maps the address", async () => {
    await expect(cepService.lookup("63031-130")).resolves.toEqual({
      zipCode: "63031-130",
      street: "Rua Artesão Manoel Barros",
      neighborhood: "Tiradentes",
      city: "Juazeiro do Norte",
      state: "CE",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/63031130/json/",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("does not call ViaCEP when the CEP is incomplete", async () => {
    await expect(cepService.lookup("63031")).rejects.toEqual(
      expect.objectContaining({ code: "invalid" }),
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("treats { erro: true } as not found", async () => {
    mockFetch(
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ erro: true }),
      }),
    );

    await expect(cepService.lookup("00000000")).rejects.toEqual(
      new CepLookupError("CEP não encontrado.", "not_found"),
    );
  });

  it("times out when ViaCEP does not answer", async () => {
    vi.useFakeTimers();
    mockFetch(abortableHang());

    const pending = cepService.lookup("63031130");
    const assertion = expect(pending).rejects.toMatchObject({
      code: "timeout",
    });
    await vi.advanceTimersByTimeAsync(CEP_LOOKUP_TIMEOUT_MS);
    await assertion;
  });

  it("propagates caller abort instead of mapping it to timeout", async () => {
    mockFetch(abortableHang());
    const controller = new AbortController();

    const pending = cepService.lookup("63031130", controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
