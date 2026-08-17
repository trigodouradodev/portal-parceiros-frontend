import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarDayCell } from "@/components/ui/CalendarDayCell";
import {
  buildCalendarCells,
  MONTH_LABELS,
  startOfDay,
  toValidDate,
  WEEKDAY_LABELS,
} from "@/components/ui/calendar-utils";

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
  const selectedDate = toValidDate(selected);
  const min = toValidDate(minDate);
  const max = toValidDate(maxDate);
  const initialMonth = startOfDay(selectedDate ?? min ?? new Date());
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const minDay = min ? startOfDay(min) : undefined;
  const maxDay = max ? startOfDay(max) : undefined;

  const cells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const prevMonthEnd = new Date(viewYear, viewMonth, 0);
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  const canGoPrev = !minDay || prevMonthEnd >= minDay;
  const canGoNext = !maxDay || nextMonthStart <= maxDay;

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
            selected={selectedDate}
            min={minDay}
            max={maxDay}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
