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
