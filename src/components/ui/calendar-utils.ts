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
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
