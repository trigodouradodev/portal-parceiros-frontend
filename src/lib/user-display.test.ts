import {
  getFirstName,
  getGreeting,
  getInitials,
  getRoleLabel,
} from "@/lib/user-display";

describe("getInitials", () => {
  it("usa primeiro + último nome", () => {
    expect(getInitials("Ana Silva")).toBe("AS");
    expect(getInitials("Ana Silva Costa")).toBe("AC");
    expect(getInitials("Ana")).toBe("A");
  });

  it("ignora conectores/nome do meio (não usa a segunda palavra)", () => {
    expect(getInitials("Ianca da Silva Sena")).toBe("IS");
  });
});

describe("getFirstName", () => {
  it("returns the first token", () => {
    expect(getFirstName("Gabriel Souza")).toBe("Gabriel");
    expect(getFirstName("Maria")).toBe("Maria");
  });
});

describe("getGreeting", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns Bom dia before noon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 9, 0, 0));
    expect(getGreeting()).toBe("Bom dia");
  });

  it("returns Boa tarde in the afternoon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 15, 0, 0));
    expect(getGreeting()).toBe("Boa tarde");
  });

  it("returns Boa noite at night", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 21, 0, 0));
    expect(getGreeting()).toBe("Boa noite");
  });
});

describe("getRoleLabel", () => {
  it("maps known roles and normalizes prefixes", () => {
    expect(getRoleLabel("CONSULTANT")).toBe("Consultor");
    expect(getRoleLabel("ROLE_COLLECTION_AGENT")).toBe("Agente de cobrança");
    expect(getRoleLabel("admin")).toBe("Administrador");
  });

  it("falls back to Agente", () => {
    expect(getRoleLabel(null)).toBe("Agente");
    expect(getRoleLabel(undefined)).toBe("Agente");
    expect(getRoleLabel("UNKNOWN")).toBe("Agente");
  });
});
