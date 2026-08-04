import { formatTaxId } from "@/lib/format/tax-id";

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
