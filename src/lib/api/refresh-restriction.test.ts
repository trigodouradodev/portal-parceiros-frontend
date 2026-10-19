import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import api from "@/lib/api/axios";
import {
  PARTNER_ACCESS_RESTRICTED,
  readLogoutReasonMessage,
} from "@/lib/partner-restrictions";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

function axiosFailure(
  status: number,
  data: unknown,
  config: InternalAxiosRequestConfig,
) {
  return new AxiosError("falha", "ERR_BAD_REQUEST", config, undefined, {
    status,
    data,
    statusText: String(status),
    headers: {},
    config,
  });
}

describe("renovação de sessão recusada (AUREA-623)", () => {
  const originalAdapter = api.defaults.adapter;

  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
    vi.stubGlobal("sessionStorage", memoryStorage());
    localStorage.setItem("access_token", "expirado");
    localStorage.setItem("refresh_token", "refresh");
    // a primeira chamada à API volta 401, o que dispara o refresh
    api.defaults.adapter = (config) =>
      Promise.reject(axiosFailure(401, {}, config));
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("refresh com 403 de restrição encerra a sessão e guarda o motivo para o login", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(
      axiosFailure(
        403,
        { code: PARTNER_ACCESS_RESTRICTED },
        {} as InternalAxiosRequestConfig,
      ),
    );

    await expect(api.get("/quotes")).rejects.toBeDefined();

    expect(readLogoutReasonMessage()).toBe(
      "Acesso bloqueado. Fale com seu gerente.",
    );
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });

  it("refresh recusado por outro motivo encerra a sessão sem registrar o motivo de restrição", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(
      axiosFailure(403, {}, {} as InternalAxiosRequestConfig),
    );

    await expect(api.get("/quotes")).rejects.toBeDefined();

    expect(readLogoutReasonMessage()).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});
