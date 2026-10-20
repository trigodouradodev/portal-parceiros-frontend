import {
  clearLogoutReason,
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
