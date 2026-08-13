import { describe, expect, it } from "vitest";
import { isEligibleCpf } from "@/features/originacao/data/eligibility";

describe("isEligibleCpf", () => {
  it("rejects incomplete or invalid CPF", () => {
    expect(isEligibleCpf("123.456.789")).toBe(false);
    expect(isEligibleCpf("")).toBe(false);
    expect(isEligibleCpf("111.111.111-11")).toBe(false);
    expect(isEligibleCpf("123.456.789-00")).toBe(false);
    expect(isEligibleCpf("078.520.263-80")).toBe(false);
  });

  it("is deterministic for the same valid CPF", () => {
    const cpf = "111.444.777-35";
    expect(isEligibleCpf(cpf)).toBe(isEligibleCpf(cpf));
  });

  it("treats digit sum % 4 === 0 as eligible (valid CPFs only)", () => {
    // 1+1+1+4+4+4+7+7+7+3+5 = 44 → elegível
    expect(isEligibleCpf("111.444.777-35")).toBe(true);
    // 5+2+9+9+8+2+2+4+7+2+5 = 55 → não elegível
    expect(isEligibleCpf("529.982.247-25")).toBe(false);
  });
});
