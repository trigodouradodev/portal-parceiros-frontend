import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostponeControl } from "@/features/dashboard/components/task-cards/PostponeControl";
import { RescheduledVisitBadge } from "@/features/dashboard/components/task-cards/RescheduledVisitBadge";
import { VISIT_RESCHEDULE_WINDOW_DAYS } from "@/features/dashboard/constants/visit-reschedule";

interface VisitSecondaryActionsProps {
  canRescheduleVisit: boolean;
  wasRescheduled: boolean;
  rescheduleCount: number;
  rescheduledDateLabel?: string;
  canPostpone: boolean;
  onOpenReschedule: () => void;
  onPostponeClick: () => void;
}

export function VisitSecondaryActions({
  canRescheduleVisit,
  wasRescheduled,
  rescheduleCount,
  rescheduledDateLabel,
  canPostpone,
  onOpenReschedule,
  onPostponeClick,
}: VisitSecondaryActionsProps) {
  const isLastReschedule = rescheduleCount === 1;
  const rescheduleLabel = isLastReschedule ? "Reagendar" : "Agendar";
  const rescheduleTitle = isLastReschedule
    ? `Reagendar a visita para até ${VISIT_RESCHEDULE_WINDOW_DAYS} dias (última chance)`
    : `Agendar a visita para até ${VISIT_RESCHEDULE_WINDOW_DAYS} dias`;

  let rescheduleControl: ReactNode = (
    <RescheduledVisitBadge
      wasRescheduled={wasRescheduled}
      rescheduledDateLabel={rescheduledDateLabel}
    />
  );

  if (canRescheduleVisit) {
    rescheduleControl = (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 gap-1 border-[#E2E4EC] px-3 text-xs text-[#6B7080] hover:border-brand-navy hover:text-brand-navy"
        onClick={onOpenReschedule}
        title={rescheduleTitle}
      >
        <CalendarDays size={13} />
        {rescheduleLabel}
      </Button>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      {rescheduleControl}
      <PostponeControl
        canPostpone={canPostpone}
        onPostponeClick={onPostponeClick}
        buttonClassName="h-9 gap-1 border-[#E2E4EC] px-3 text-xs text-[#6B7080] hover:border-[#F5C37A] hover:text-[#854F0B]"
      />
    </div>
  );
}
