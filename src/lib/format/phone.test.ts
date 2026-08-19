import { describe, expect, it } from "vitest";
import { digitsOnlyPhone, formatPhone } from "@/lib/format/phone";

describe("digitsOnlyPhone", () => {
  it("keeps digits and caps at 20", () => {
    expect(digitsOnlyPhone("(11) 99400-7722")).toBe("11994007722");
  });
});

describe("formatPhone", () => {
  it("masks progressively", () => {
    expect(formatPhone("8")).toBe("(8");
    expect(formatPhone("88")).toBe("(88");
    expect(formatPhone("889")).toBe("(88) 9");
    expect(formatPhone("889970")).toBe("(88) 9970");
    expect(formatPhone("88997026")).toBe("(88) 9970-26");
    expect(formatPhone("88997026551")).toBe("(88) 99702-6551");
  });
});
