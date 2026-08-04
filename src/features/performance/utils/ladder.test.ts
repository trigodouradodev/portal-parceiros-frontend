import {
  buildDisbursementLadder,
  buildRateLadder,
  buildRiskLadder,
} from "@/features/performance/utils/ladder";
import { testProgram } from "@/test/fixtures/performance";

describe("buildDisbursementLadder", () => {
  it("builds segments and clamps marker position", () => {
    const ladder = buildDisbursementLadder(testProgram);

    expect(ladder.segments.length).toBeGreaterThan(0);
    expect(ladder.maxBonus).toBe(30);
    expect(ladder.markerPct(0)).toBe(0);
    expect(ladder.markerPct(ladder.sliderMax)).toBe(100);
    expect(ladder.markerPct(-10)).toBe(0);
    expect(ladder.scale[0]).toBe("0%");
  });
});

describe("buildRiskLadder", () => {
  it("uses descending color direction and positive range", () => {
    const ladder = buildRiskLadder(testProgram);

    expect(ladder.segments.length).toBeGreaterThan(0);
    expect(ladder.sliderMin).toBe(0);
    expect(ladder.sliderMax).toBeGreaterThan(0);
    expect(ladder.markerPct(ladder.sliderMax / 2)).toBeGreaterThan(0);
  });
});

describe("buildRateLadder", () => {
  it("starts visual range near first rate threshold", () => {
    const ladder = buildRateLadder(testProgram);

    expect(ladder.sliderMin).toBeGreaterThanOrEqual(0);
    expect(ladder.sliderMax).toBeGreaterThan(ladder.sliderMin);
    expect(ladder.maxBonus).toBe(20);
  });
});
