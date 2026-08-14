import { calcInstallment, cn, fmtBRL } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
  });
});

describe("fmtBRL", () => {
  it("formats currency in pt-BR", () => {
    expect(fmtBRL(1500)).toMatch(/R\$\s*1\.500,00/);
    expect(fmtBRL(0)).toMatch(/R\$\s*0,00/);
  });
});

describe("calcInstallment", () => {
  it("returns 0 for non-positive principal or installments", () => {
    expect(calcInstallment(0, 10, 3.39)).toBe(0);
    expect(calcInstallment(5000, 0, 3.39)).toBe(0);
    expect(calcInstallment(-100, 10, 3.39)).toBe(0);
  });

  it("divides principal when rate is 0", () => {
    expect(calcInstallment(5000, 10, 0)).toBe(500);
  });

  it("computes PRICE installment for a positive rate", () => {
    const installment = calcInstallment(5000, 10, 3.39);
    const i = 0.0339;
    const expected = (5000 * i) / (1 - Math.pow(1 + i, -10));
    expect(installment).toBeCloseTo(expected, 6);
    expect(installment).toBeGreaterThan(500);
  });
});
