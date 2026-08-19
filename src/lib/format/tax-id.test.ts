import { describe, expect, it } from "vitest";
import { formatCnpj, formatCpf, formatTaxId } from "@/lib/format/tax-id";

describe("formatCpf", () => {
  it("masks progressively", () => {
    expect(formatCpf("1")).toBe("1");
    expect(formatCpf("123")).toBe("123");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("12345678901")).toBe("123.456.789-01");
  });

  it("strips non-digits and caps at 11", () => {
    expect(formatCpf("abc123.456.789-01999")).toBe("123.456.789-01");
  });
});

describe("formatCnpj", () => {
  it("masks progressively", () => {
    expect(formatCnpj("1")).toBe("1");
    expect(formatCnpj("12")).toBe("12");
    expect(formatCnpj("123")).toBe("12.3");
    expect(formatCnpj("12345678")).toBe("12.345.678");
    expect(formatCnpj("123456780001")).toBe("12.345.678/0001");
    expect(formatCnpj("12345678000195")).toBe("12.345.678/0001-95");
  });

  it("strips non-digits and caps at 14", () => {
    expect(formatCnpj("abc12.345.678/0001-9599")).toBe("12.345.678/0001-95");
  });
});

describe("formatTaxId", () => {
  it("formats CPF", () => {
    expect(formatTaxId("12345678901")).toBe("123.456.789-01");
    expect(formatTaxId("123.456.789-01")).toBe("123.456.789-01");
  });

  it("formats CNPJ", () => {
    expect(formatTaxId("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("returns original when length is neither CPF nor CNPJ", () => {
    expect(formatTaxId("123")).toBe("123");
    expect(formatTaxId("abc")).toBe("abc");
  });
});
