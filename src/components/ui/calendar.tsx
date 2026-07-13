import { useState } from "react";
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

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(viewYear, viewMonth, index + 1),
    ),
  ];

  function goToMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const prevMonthEnd = new Date(viewYear, viewMonth, 0);
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  const canGoPrev = !min || prevMonthEnd >= min;
  const canGoNext = !max || nextMonthStart <= max;

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
        {cells.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-8" />;
          }

          const disabled = (min && date < min) || (max && date > max);
          const isSelected = selected && isSameDay(date, selected);

          return (
            <button
              key={index}
              type="button"
              disabled={!!disabled}
              onClick={() => onSelect(date)}
              className={cn(
                "h-8 rounded-lg text-sm font-medium transition-colors",
                disabled
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : isSelected
                    ? "bg-brand-navy text-white"
                    : "text-foreground hover:bg-muted",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
