import {
  addDays,
  buildCalendarCells,
  buildYearPage,
  getCalendarYearBounds,
  getDayCellClassName,
  getYearPageStart,
  isMonthInRange,
  isSameDay,
  isYearInRange,
  startOfDay,
  toValidDate,
} from "@/components/ui/calendar-utils";

describe("startOfDay", () => {
  it("zeros time components", () => {
    const result = startOfDay(new Date(2026, 5, 15, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("toValidDate", () => {
  it("returns undefined for empty or invalid values", () => {
    expect(toValidDate(null)).toBeUndefined();
    expect(toValidDate(undefined)).toBeUndefined();
    expect(toValidDate("")).toBeUndefined();
    expect(toValidDate("not-a-date")).toBeUndefined();
  });

  it("parses valid dates", () => {
    expect(toValidDate("2026-01-15")).toBeInstanceOf(Date);
    expect(toValidDate(new Date(2026, 0, 1))).toBeInstanceOf(Date);
  });
});

describe("isSameDay / addDays", () => {
  it("compares calendar days", () => {
    const a = new Date(2026, 0, 1, 8);
    const b = new Date(2026, 0, 1, 23);
    const c = new Date(2026, 0, 2);
    expect(isSameDay(a, b)).toBe(true);
    expect(isSameDay(a, c)).toBe(false);
  });

  it("adds days", () => {
    const base = new Date(2026, 0, 30);
    expect(addDays(base, 2).getDate()).toBe(1);
    expect(addDays(base, 2).getMonth()).toBe(1);
  });
});

describe("buildCalendarCells", () => {
  it("pads leading blanks and fills month days", () => {
    // January 2026 starts on Thursday (day 4)
    const cells = buildCalendarCells(2026, 0);
    expect(cells.slice(0, 4).every((cell) => cell === null)).toBe(true);
    expect(cells.filter((cell) => cell !== null)).toHaveLength(31);
    expect(cells[4]?.getDate()).toBe(1);
  });
});

describe("getDayCellClassName", () => {
  it("returns state classes", () => {
    expect(getDayCellClassName(true, false)).toContain("cursor-not-allowed");
    expect(getDayCellClassName(false, true)).toContain("bg-brand-navy");
    expect(getDayCellClassName(false, false)).toContain("hover:bg-muted");
  });
});

describe("month / year range", () => {
  const min = new Date(2026, 8, 1);
  const max = new Date(2026, 10, 15);

  it("keeps months that overlap the range", () => {
    expect(isMonthInRange(2026, 7, min, max)).toBe(false);
    expect(isMonthInRange(2026, 8, min, max)).toBe(true);
    expect(isMonthInRange(2026, 10, min, max)).toBe(true);
    expect(isMonthInRange(2026, 11, min, max)).toBe(false);
  });

  it("keeps years that overlap the range", () => {
    expect(isYearInRange(2025, min, max)).toBe(false);
    expect(isYearInRange(2026, min, max)).toBe(true);
    expect(isYearInRange(2027, min, max)).toBe(false);
  });

  it("uses min/max years when provided", () => {
    expect(getCalendarYearBounds(min, max)).toEqual({
      minYear: 2026,
      maxYear: 2026,
    });
  });

  it("falls back to a lookback window", () => {
    const today = new Date(2026, 7, 17);
    expect(getCalendarYearBounds(undefined, undefined, today)).toEqual({
      minYear: 2011,
      maxYear: 2026,
    });
  });

  it("pages years from the lower bound", () => {
    expect(getYearPageStart(2026, 2011)).toBe(2023);
    expect(buildYearPage(2023)).toEqual([
      2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034,
    ]);
  });
});
