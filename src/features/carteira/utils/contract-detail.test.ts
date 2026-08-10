import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  daysOverdueFromDueDate,
  formatDaysOverdue,
  formatRenegotiated,
} from "./contract-detail";

describe("daysOverdueFromDueDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7)); // 7 ago 2026 local
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when due date is missing", () => {
    expect(daysOverdueFromDueDate(undefined)).toBeNull();
    expect(daysOverdueFromDueDate("")).toBeNull();
  });

  it("returns 0 when due date is today or in the future", () => {
    expect(daysOverdueFromDueDate("2026-08-07")).toBe(0);
    expect(daysOverdueFromDueDate("2026-08-10")).toBe(0);
  });

  it("returns calendar days past due", () => {
    expect(daysOverdueFromDueDate("2026-08-01")).toBe(6);
    expect(daysOverdueFromDueDate("2026-08-06")).toBe(1);
  });
});

describe("formatDaysOverdue", () => {
  it("formats null, zero and plural", () => {
    expect(formatDaysOverdue(null)).toBe("—");
    expect(formatDaysOverdue(0)).toBe("Em dia");
    expect(formatDaysOverdue(1)).toBe("1 dia");
    expect(formatDaysOverdue(12)).toBe("12 dias");
  });
});

describe("formatRenegotiated", () => {
  it("shows dash when API omits the field", () => {
    expect(formatRenegotiated(undefined)).toBe("—");
    expect(formatRenegotiated(true)).toBe("Sim");
    expect(formatRenegotiated(false)).toBe("Não");
  });
});
