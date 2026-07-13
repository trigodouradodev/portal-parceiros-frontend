import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_LABELS = [
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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarCells(
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

function getDayCellClassName(disabled: boolean, isSelected: boolean): string {
  if (disabled) {
    return "cursor-not-allowed text-muted-foreground/40";
  }

  if (isSelected) {
    return "bg-brand-navy text-white";
  }

  return "text-foreground hover:bg-muted";
}

interface CalendarDayCellProps {
  date: Date | null;
  index: number;
  selected?: Date;
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
}

function CalendarDayCell({
  date,
  index,
  selected,
  min,
  max,
  onSelect,
}: CalendarDayCellProps) {
  if (!date) {
    return <div key={index} className="h-8" />;
  }

  const disabled = Boolean((min && date < min) || (max && date > max));
  const isSelected = Boolean(selected && isSameDay(date, selected));

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(date)}
      className={cn(
        "h-8 rounded-lg text-sm font-medium transition-colors",
        getDayCellClassName(disabled, isSelected),
      )}
    >
      {date.getDate()}
    </button>
  );
}

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
}: CalendarProps) {
  const initialMonth = startOfDay(selected ?? minDate ?? new Date());
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const min = minDate ? startOfDay(minDate) : undefined;
  const max = maxDate ? startOfDay(maxDate) : undefined;

  const cells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const prevMonthEnd = new Date(viewYear, viewMonth, 0);
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  const canGoPrev = !min || prevMonthEnd >= min;
  const canGoNext = !max || nextMonthStart <= max;

  function goToMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className={cn("w-[264px]", className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => canGoPrev && goToMonth(-1)}
          disabled={!canGoPrev}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-foreground">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={() => canGoNext && goToMonth(1)}
          disabled={!canGoNext}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((weekday, index) => (
          <div
            key={index}
            className="flex h-7 items-center justify-center text-[11px] font-semibold text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => (
          <CalendarDayCell
            key={index}
            date={date}
            index={index}
            selected={selected}
            min={min}
            max={max}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
