import { useMemo, useState } from "react";
import { CalendarDays, ChevronUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChargeQueueCompactRow } from "@/features/dashboard/components/task-cards/ChargeQueueCompactRow";
import { InitialsAvatar } from "@/features/dashboard/components/task-cards/InitialsAvatar";
import { mapOverdueToQueueDisplay } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import { formatDate } from "@/lib/format/date";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

interface ScheduledTaskCardProps {
  item: OverdueCollectionItem;
  position: number;
  highlighted?: boolean;
  onOpen: () => void;
  onExecuteNow: () => void;
}

/** Tarefa futura que pode ser executada antecipadamente pelo responsável. */
export function ScheduledTaskCard({
  item,
  position,
  highlighted = false,
  onOpen,
  onExecuteNow,
}: ScheduledTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const display = useMemo(
    () => mapOverdueToQueueDisplay(item, position),
    [item, position],
  );
  const { client, contractLabel } = display;

  if (!isExpanded) {
    return (
      <ChargeQueueCompactRow
        display={display}
        locked={false}
        expandable
        installmentId={item.installment.id}
        highlighted={highlighted}
        onOpen={() => setIsExpanded(true)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-[#B8DED2] bg-[#F5FBF8] p-3">
      <div className="flex items-center gap-3">
        <InitialsAvatar
          initials={getInitials(client.name)}
          size="sm"
          variant="muted"
        />
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onOpen}
        >
          <p className="truncate text-sm font-medium text-[#374151]">
            {client.name}
          </p>
          <p className="truncate text-xs text-[#9DA3B4]">
            {display.pendingActionLabel} · {contractLabel}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-xs font-semibold text-[#374151]">
            {fmtBRL(client.value)}
          </p>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 text-brand-navy/60"
            onClick={() => setIsExpanded(false)}
            aria-label="Recolher tarefa agendada"
          >
            <ChevronUp size={15} />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#0F6E56]">
        <CalendarDays size={13} />
        Agendada para {item.expireDate ? formatDate(item.expireDate) : "—"}
      </div>

      <Button
        type="button"
        size="sm"
        className="mt-3 h-9 w-full gap-1.5 bg-brand-navy text-xs text-white hover:bg-brand-navy/90"
        onClick={onExecuteNow}
      >
        <MapPin size={12} />
        Executar agora
      </Button>
    </div>
  );
}
