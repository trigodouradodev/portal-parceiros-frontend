import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarDayCell } from "@/components/ui/CalendarDayCell";
import {
  MONTH_LABELS,
  MONTH_SHORT_LABELS,
  WEEKDAY_LABELS,
  YEAR_PAGE_SIZE,
  buildCalendarCells,
  buildYearPage,
  getCalendarYearBounds,
  getDayCellClassName,
  getYearPageStart,
  isMonthInRange,
  isYearInRange,
  startOfDay,
  toValidDate,
} from "@/components/ui/calendar-utils";

type CalendarLevel = "days" | "months" | "years";

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
  const [level, setLevel] = useState<CalendarLevel>("days");

  const minDay = min ? startOfDay(min) : undefined;
  const maxDay = max ? startOfDay(max) : undefined;
  const { minYear, maxYear } = getCalendarYearBounds(minDay, maxDay);
  const yearPageStart = getYearPageStart(viewYear, minYear);
  const years = useMemo(() => buildYearPage(yearPageStart), [yearPageStart]);

  const cells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const prevMonthEnd = new Date(viewYear, viewMonth, 0);
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  const prevMonthYear = new Date(viewYear, viewMonth - 1, 1).getFullYear();
  const nextMonthYear = nextMonthStart.getFullYear();
  const canGoPrev =
    level === "days"
      ? (!minDay || prevMonthEnd >= minDay) && prevMonthYear >= minYear
      : level === "months"
        ? viewYear - 1 >= minYear
        : yearPageStart > minYear;
  const canGoNext =
    level === "days"
      ? (!maxDay || nextMonthStart <= maxDay) && nextMonthYear <= maxYear
      : level === "months"
        ? viewYear + 1 <= maxYear
        : yearPageStart + YEAR_PAGE_SIZE <= maxYear;

  function goToMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function goPrev() {
    if (!canGoPrev) return;
    if (level === "days") goToMonth(-1);
    else if (level === "months") setViewYear((year) => year - 1);
    else setViewYear(yearPageStart - 1);
  }

  function goNext() {
    if (!canGoNext) return;
    if (level === "days") goToMonth(1);
    else if (level === "months") setViewYear((year) => year + 1);
    else setViewYear(yearPageStart + YEAR_PAGE_SIZE);
  }

  function selectMonth(month: number) {
    setViewMonth(month);
    setLevel("days");
  }

  function selectYear(year: number) {
    setViewYear(year);
    setLevel("months");
  }

  const prevLabel =
    level === "days"
      ? "Mês anterior"
      : level === "months"
        ? "Ano anterior"
        : "Anos anteriores";
  const nextLabel =
    level === "days"
      ? "Próximo mês"
      : level === "months"
        ? "Próximo ano"
        : "Próximos anos";

  return (
    <div className={cn("w-[264px]", className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label={prevLabel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        {level === "years" ? (
          <p className="text-sm font-semibold text-foreground">
            {yearPageStart}–{yearPageStart + YEAR_PAGE_SIZE - 1}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setLevel(level === "days" ? "months" : "years")}
            aria-label={level === "days" ? "Escolher mês" : "Escolher ano"}
            className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {level === "days"
              ? `${MONTH_LABELS[viewMonth]} ${viewYear}`
              : viewYear}
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label={nextLabel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {level === "days" ? (
        <>
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
        </>
      ) : null}

      {level === "months" ? (
        <div className="grid grid-cols-3 gap-1">
          {MONTH_LABELS.map((label, month) => {
            const disabled = !isMonthInRange(viewYear, month, minDay, maxDay);
            const isSelected =
              selectedDate?.getFullYear() === viewYear
                ? selectedDate.getMonth() === month
                : month === viewMonth;
            return (
              <button
                key={label}
                type="button"
                disabled={disabled}
                aria-label={`${label} ${viewYear}`}
                onClick={() => selectMonth(month)}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-colors",
                  getDayCellClassName(disabled, isSelected),
                )}
              >
                {MONTH_SHORT_LABELS[month]}
              </button>
            );
          })}
        </div>
      ) : null}

      {level === "years" ? (
        <div className="grid grid-cols-3 gap-1">
          {years.map((year) => {
            const disabled =
              year < minYear ||
              year > maxYear ||
              !isYearInRange(year, minDay, maxDay);
            const isSelected =
              (selectedDate?.getFullYear() ?? viewYear) === year;
            return (
              <button
                key={year}
                type="button"
                disabled={disabled}
                aria-label={String(year)}
                onClick={() => selectYear(year)}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-colors",
                  getDayCellClassName(disabled, isSelected),
                )}
              >
                {year}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
