import { describe, expect, it } from "vitest";
import {
  formatCep,
  isCompleteCep,
} from "@/features/originacao/utils/format-cep";

describe("formatCep", () => {
  it("masks progressively", () => {
    expect(formatCep("0")).toBe("0");
    expect(formatCep("01001")).toBe("01001");
    expect(formatCep("01001000")).toBe("01001-000");
  });

  it("strips non-digits and caps at 8", () => {
    expect(formatCep("abc01001-00099")).toBe("01001-000");
  });
});

describe("isCompleteCep", () => {
  it("requires 8 digits", () => {
    expect(isCompleteCep("010")).toBe(false);
    expect(isCompleteCep("01001-000")).toBe(true);
  });
});
