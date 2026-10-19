import { buildMonthOptions } from "./build-month-options";
import { getPeriodLabel } from "./format";

describe("competence options", () => {
  it("adds the current month without data and sorts the available history", () => {
    const options = buildMonthOptions({
      currentMonth: "2026-10",
      months: [{ month: "2026-08" }, { month: "2026-09" }],
    });
    expect(options.map((option) => option.value)).toEqual([
      "2026-10",
      "2026-09",
      "2026-08",
    ]);
    expect(options[0]?.label).toBe("outubro - 2026");
    expect(options[1]?.label).toBe("setembro - 2026");
    expect(options[2]?.label).toBe("agosto - 2026");
  });
  it("does not duplicate a current month already present in the source", () => {
    expect(
      buildMonthOptions({
        currentMonth: "2026-10",
        months: [{ month: "2026-10" }],
      }),
    ).toEqual([{ value: "2026-10", label: "outubro - 2026" }]);
  });
  it("does not label a future competence as a complete month", () => {
    expect(getPeriodLabel("2026-11", "2026-10")).toBe("Competência futura");
  });
});
