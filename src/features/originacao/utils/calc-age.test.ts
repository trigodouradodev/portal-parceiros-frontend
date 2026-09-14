import { describe, expect, it } from "vitest";
import {
  calcAge,
  isAdultAge,
  maxAdultBirthIso,
  todayIsoLocal,
} from "@/features/originacao/utils/calc-age";

describe("calcAge", () => {
  const today = new Date(2026, 7, 12); // 12/08/2026

  it("returns null for empty or invalid dates", () => {
    expect(calcAge("", today)).toBeNull();
    expect(calcAge("12/08/2000", today)).toBeNull();
    expect(calcAge("2026-02-30", today)).toBeNull();
  });

  it("computes age before and after birthday", () => {
    expect(calcAge("2008-08-13", today)).toBe(17);
    expect(calcAge("2008-08-12", today)).toBe(18);
    expect(calcAge("2008-08-11", today)).toBe(18);
  });
});

describe("isAdultAge", () => {
  it("requires 18–120", () => {
    expect(isAdultAge(null)).toBe(false);
    expect(isAdultAge(17)).toBe(false);
    expect(isAdultAge(18)).toBe(true);
    expect(isAdultAge(120)).toBe(true);
    expect(isAdultAge(121)).toBe(false);
  });
});

describe("todayIsoLocal", () => {
  it("formats local calendar date", () => {
    expect(todayIsoLocal(new Date(2026, 7, 12))).toBe("2026-08-12");
  });
});

describe("maxAdultBirthIso", () => {
  it("is 18 years before today", () => {
    expect(maxAdultBirthIso(new Date(2026, 7, 21))).toBe("2008-08-21");
  });
});
