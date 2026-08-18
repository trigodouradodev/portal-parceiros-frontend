import { describe, expect, it } from "vitest";
import { isValidCpf } from "@/lib/validation/cpf";

describe("isValidCpf", () => {
  it("accepts known valid CPFs", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("390.533.447-05")).toBe(true);
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });

  it("rejects incomplete or malformed values", () => {
    expect(isValidCpf("")).toBe(false);
    expect(isValidCpf("123.456.789")).toBe(false);
    expect(isValidCpf("123.456.789-00")).toBe(false);
  });

  it("rejects repeated-digit sequences", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("000.000.000-00")).toBe(false);
  });
});
