import { describe, expect, it } from "vitest";
import { formatCnpj } from "@/features/originacao/utils/format-cnpj";

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
