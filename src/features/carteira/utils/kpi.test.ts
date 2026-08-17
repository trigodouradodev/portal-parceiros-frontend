import { describe, expect, it } from "vitest";
import { fmtInt, fmtPct, inadTone } from "@/features/carteira/utils/kpi";

describe("inadTone", () => {
  it("marks up to 5% as ok", () => {
    expect(inadTone(0)).toBe("ok");
    expect(inadTone(5)).toBe("ok");
  });

  it("marks between 5 and 15 as warn", () => {
    expect(inadTone(5.01)).toBe("warn");
    expect(inadTone(15)).toBe("warn");
  });

  it("marks above 15 as crit", () => {
    expect(inadTone(15.01)).toBe("crit");
  });
});

describe("kpi formatters", () => {
  it("formats percent and integers in pt-BR", () => {
    expect(fmtPct(12.3)).toBe("12,30%");
    expect(fmtInt(1234)).toBe("1.234");
  });
});
