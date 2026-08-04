import { bandTone } from "@/features/performance/utils/tone";

describe("bandTone", () => {
  it("returns crit when bonus is zero or negative", () => {
    expect(bandTone(0, 10)).toBe("crit");
    expect(bandTone(-1, 10)).toBe("crit");
  });

  it("returns warn when below max", () => {
    expect(bandTone(5, 10)).toBe("warn");
  });

  it("returns ok at or above max", () => {
    expect(bandTone(10, 10)).toBe("ok");
    expect(bandTone(12, 10)).toBe("ok");
  });
});
