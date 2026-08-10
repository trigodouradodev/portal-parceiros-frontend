import { describe, expect, it } from "vitest";
import { formatTrendDelta, trendDirection, trendSentiment } from "./safra";

describe("trendDirection", () => {
  it("treats tiny deltas as flat (RN06)", () => {
    expect(trendDirection(0.004)).toBe("flat");
    expect(trendDirection(-0.004)).toBe("flat");
    expect(trendDirection(0.006)).toBe("up");
    expect(trendDirection(-0.006)).toBe("down");
  });
});

describe("trendSentiment", () => {
  it("marks rising as bad when inverted", () => {
    expect(trendSentiment(0.5, true)).toBe("bad");
    expect(trendSentiment(-0.5, true)).toBe("good");
    expect(trendSentiment(0.001, true)).toBe("neutral");
  });

  it("marks rising as good when not inverted", () => {
    expect(trendSentiment(0.5, false)).toBe("good");
    expect(trendSentiment(-0.5, false)).toBe("bad");
  });
});

describe("formatTrendDelta", () => {
  it("formats with sign and pp suffix", () => {
    expect(formatTrendDelta(1.25)).toBe("+1.25pp");
    expect(formatTrendDelta(-0.4)).toBe("-0.40pp");
  });
});
