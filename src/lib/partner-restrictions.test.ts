import { AxiosError } from "axios";
import {
  clearLogoutReason,
  getApiErrorCode,
  PARTNER_ACCESS_RESTRICTED,
  PARTNER_ACCESS_RESTRICTED_MESSAGE,
  readLogoutReasonMessage,
  rememberAccessRestrictedLogout,
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

function forbidden(data: unknown) {
  return new AxiosError("Forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 403,
    data,
    statusText: "Forbidden",
    headers: {},
    config: { headers: {} as never },
  });
}

describe("getApiErrorCode", () => {
  it("devolve o code do corpo do erro da API", () => {
    expect(
      getApiErrorCode(forbidden({ code: PARTNER_ACCESS_RESTRICTED })),
    ).toBe(PARTNER_ACCESS_RESTRICTED);
  });

  it("devolve undefined sem code, com code que não é texto ou fora de um erro da API", () => {
    expect(getApiErrorCode(forbidden({}))).toBeUndefined();
    expect(getApiErrorCode(forbidden({ code: 403 }))).toBeUndefined();
    expect(getApiErrorCode(new Error("x"))).toBeUndefined();
    expect(getApiErrorCode(undefined)).toBeUndefined();
  });
});

describe("motivo do encerramento da sessão", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", memoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sem registro, não há mensagem", () => {
    expect(readLogoutReasonMessage()).toBeNull();
  });

  it("registra, lê a mensagem de acesso bloqueado e limpa", () => {
    rememberAccessRestrictedLogout();

    expect(readLogoutReasonMessage()).toBe(PARTNER_ACCESS_RESTRICTED_MESSAGE);
    // ler não consome: o login pode renderizar duas vezes (StrictMode)
    expect(readLogoutReasonMessage()).toBe(PARTNER_ACCESS_RESTRICTED_MESSAGE);

    clearLogoutReason();
    expect(readLogoutReasonMessage()).toBeNull();
  });

  it("sessionStorage indisponível não quebra nada", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
      removeItem: () => {
        throw new Error("bloqueado");
      },
    });

    expect(() => rememberAccessRestrictedLogout()).not.toThrow();
    expect(readLogoutReasonMessage()).toBeNull();
    expect(() => clearLogoutReason()).not.toThrow();
  });
});
