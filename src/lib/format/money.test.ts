import { describe, expect, it } from "vitest";
import { formatMoneyBrl } from "@/lib/format/money";

describe("formatMoneyBrl", () => {
  it("treats digits as cents and formats pt-BR", () => {
    expect(formatMoneyBrl("")).toBe("");
    expect(formatMoneyBrl("4")).toMatch(/R\$\s*0,04/);
    expect(formatMoneyBrl("400")).toMatch(/R\$\s*4,00/);
    expect(formatMoneyBrl("40000000")).toMatch(/R\$\s*400\.000,00/);
  });

  it("strips minus and stays idempotent on a masked value", () => {
    expect(formatMoneyBrl("-10")).toMatch(/R\$\s*0,10/);
    const masked = formatMoneyBrl("1234");
    expect(formatMoneyBrl(masked)).toBe(masked);
  });

  it("caps digit length", () => {
    expect(formatMoneyBrl("1234567890123")).toMatch(/R\$\s*12\.345\.678,90/);
  });
});
