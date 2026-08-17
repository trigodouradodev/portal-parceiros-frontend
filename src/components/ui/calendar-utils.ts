export const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MONTH_SHORT_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export const YEAR_PAGE_SIZE = 12;
export const DEFAULT_YEAR_LOOKBACK = 15;

export function startOfDay(date: Date) {
  const value = date instanceof Date ? date : new Date(date);
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function toValidDate(
  value: Date | string | number | undefined | null,
): Date | undefined {
  if (value == null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildCalendarCells(
  viewYear: number,
  viewMonth: number,
): (Date | null)[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(viewYear, viewMonth, index + 1),
    ),
  ];
}

export function isMonthInRange(
  year: number,
  month: number,
  min?: Date,
  max?: Date,
): boolean {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const minDay = min ? startOfDay(min) : undefined;
  const maxDay = max ? startOfDay(max) : undefined;
  if (minDay && monthEnd < minDay) return false;
  if (maxDay && monthStart > maxDay) return false;
  return true;
}

export function isYearInRange(year: number, min?: Date, max?: Date): boolean {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const minDay = min ? startOfDay(min) : undefined;
  const maxDay = max ? startOfDay(max) : undefined;
  if (minDay && yearEnd < minDay) return false;
  if (maxDay && yearStart > maxDay) return false;
  return true;
}

export function getCalendarYearBounds(
  min?: Date,
  max?: Date,
  today = new Date(),
): { minYear: number; maxYear: number } {
  return {
    minYear: min?.getFullYear() ?? today.getFullYear() - DEFAULT_YEAR_LOOKBACK,
    maxYear: max?.getFullYear() ?? today.getFullYear(),
  };
}

export function getYearPageStart(
  year: number,
  minYear: number,
  pageSize = YEAR_PAGE_SIZE,
): number {
  const clamped = Math.max(year, minYear);
  return minYear + Math.floor((clamped - minYear) / pageSize) * pageSize;
}

export function buildYearPage(
  pageStart: number,
  pageSize = YEAR_PAGE_SIZE,
): number[] {
  return Array.from({ length: pageSize }, (_, index) => pageStart + index);
}

export function getDayCellClassName(
  disabled: boolean,
  isSelected: boolean,
): string {
  if (disabled) {
    return "cursor-not-allowed text-muted-foreground/40";
  }

  if (isSelected) {
    return "bg-brand-navy text-white";
  }

  return "text-foreground hover:bg-muted";
}
