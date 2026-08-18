import { describe, expect, it } from "vitest";
import { formatCount } from "@/features/originacao/utils/format-count";

describe("formatCount", () => {
  it("keeps only digits and allows empty", () => {
    expect(formatCount("")).toBe("");
    expect(formatCount("-10")).toBe("10");
    expect(formatCount("abc3")).toBe("3");
  });

  it("caps at max", () => {
    expect(formatCount("99")).toBe("99");
    expect(formatCount("100")).toBe("99");
    expect(formatCount("0")).toBe("0");
  });
});
