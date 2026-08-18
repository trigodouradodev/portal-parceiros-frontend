import { cn } from "@/lib/utils";
import { getDayCellClassName, isSameDay } from "@/components/ui/calendar-utils";

interface CalendarDayCellProps {
  date: Date | null;
  selected?: Date;
  min?: Date;
  max?: Date;
  isDayAllowed?: (date: Date) => boolean;
  onSelect: (date: Date) => void;
}

export function CalendarDayCell({
  date,
  selected,
  min,
  max,
  isDayAllowed,
  onSelect,
}: CalendarDayCellProps) {
  if (!date) {
    return <div className="h-8" />;
  }

  const disabled = Boolean(
    (min && date < min) ||
    (max && date > max) ||
    (isDayAllowed ? !isDayAllowed(date) : false),
  );
  const isSelected = Boolean(
    selected instanceof Date && isSameDay(date, selected),
  );

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
