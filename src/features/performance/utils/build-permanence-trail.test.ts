import { buildPermanenceTrailView } from "@/features/performance/utils/build-permanence-trail";
import { testProgram } from "@/test/fixtures/performance";

describe("buildPermanenceTrailView", () => {
  it("marks completed, current and next milestones", () => {
    const view = buildPermanenceTrailView(
      6,
      2000,
      testProgram.permanenceMilestones,
    );

    expect(view.progressPct).toBeCloseTo((6 / 18) * 100);
    expect(view.markers).toEqual([
      {
        month: 6,
        multiplier: 1,
        value: 2000,
        done: true,
        isNext: false,
        isHere: true,
      },
      {
        month: 12,
        multiplier: 2,
        value: 4000,
        done: false,
        isNext: true,
        isHere: false,
      },
      {
        month: 18,
        multiplier: 3,
        value: 6000,
        done: false,
        isNext: false,
        isHere: false,
      },
    ]);
  });
});
