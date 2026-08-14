import { describe, expect, it } from "vitest";
import { formatPhone } from "@/features/originacao/utils/format-phone";

describe("formatPhone", () => {
  it("masks progressively as mobile BR", () => {
    expect(formatPhone("8")).toBe("(8");
    expect(formatPhone("88")).toBe("(88");
    expect(formatPhone("889")).toBe("(88) 9");
    expect(formatPhone("8899702")).toBe("(88) 99702");
    expect(formatPhone("88997026551")).toBe("(88) 99702-6551");
  });

  it("strips non-digits and caps at 11", () => {
    expect(formatPhone("abc(88) 99702-6551999")).toBe("(88) 99702-6551");
  });
});
