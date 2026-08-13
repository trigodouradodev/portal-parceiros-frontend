import { describe, expect, it } from "vitest";
import { formatCpf } from "@/features/originacao/utils/format-cpf";

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
