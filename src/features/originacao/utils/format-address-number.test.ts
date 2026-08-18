import { describe, expect, it } from "vitest";
import { formatAddressNumber } from "@/features/originacao/utils/format-address-number";

describe("formatAddressNumber", () => {
  it("allows digits, letters and slash", () => {
    expect(formatAddressNumber("10A")).toBe("10A");
    expect(formatAddressNumber("s/n")).toBe("s/n");
  });

  it("strips minus and other symbols and caps length", () => {
    expect(formatAddressNumber("-10")).toBe("10");
    expect(formatAddressNumber("10-B")).toBe("10B");
    expect(formatAddressNumber("12345678901")).toBe("1234567890");
  });
});
