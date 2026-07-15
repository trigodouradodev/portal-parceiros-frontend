import { CalendarDays } from "lucide-react";

interface RescheduledVisitBadgeProps {
  wasRescheduled: boolean;
  rescheduledDateLabel?: string;
}

export function RescheduledVisitBadge({
  wasRescheduled,
  rescheduledDateLabel,
}: RescheduledVisitBadgeProps) {
  if (!wasRescheduled) return null;

  let label = "Reagendada";
  if (rescheduledDateLabel) {
    label = `Reagendada · ${rescheduledDateLabel}`;
  }

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-[#E6F7F1] px-2 text-[10px] text-[#0F6E56]">
      <CalendarDays size={11} />
      {label}
    </span>
  );
}
