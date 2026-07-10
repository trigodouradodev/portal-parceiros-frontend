import { CalendarClock, CalendarDays, Lock } from "lucide-react";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";

interface ChargeQueueCompactRowProps {
  display: ChargeQueueDisplayItem;
  locked: boolean;
  onOpen: () => void;
}

const rowClassName =
  "flex w-full items-center gap-3 rounded-xl border border-border bg-white px-3 py-3 text-left shadow-sm transition-opacity border-l-4";

/** Linha compacta bloqueada da fila de cobrança (AUREA-186 / AUREA-189). */
export function ChargeQueueCompactRow({
  display,
  locked,
  onOpen,
}: ChargeQueueCompactRowProps) {
  const {
    client,
    segment,
    queuePosition,
    contractLabel,
    wasPostponed,
    wasRescheduled,
    rescheduledDateLabel,
  } = display;
  const initials = getInitials(client.name);
  const overdueLabel = `${client.overdueDays}d atraso`;
  const className = `${rowClassName} ${segment.borderClassName} ${
    locked ? "cursor-default select-none opacity-75" : ""
  }`;

  const content = (
    <>
      <div className="flex w-8 shrink-0 flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold text-muted-foreground">
          #{queuePosition}
        </span>
        {locked && <Lock size={10} className="text-muted-foreground/70" />}
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-navy">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {client.name}
          </p>
          {wasPostponed && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#FDF3E0] px-1.5 py-0.5 text-[9px] text-[#BA7517]">
              <CalendarClock size={8} /> postergado · amanhã
            </span>
          )}
          {wasRescheduled && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#E6F7F1] px-1.5 py-0.5 text-[9px] text-[#0F6E56]">
              <CalendarDays size={8} />
              {rescheduledDateLabel
                ? `visita em ${rescheduledDateLabel}`
                : "visita reagendada"}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {display.pendingActionLabel} — Contrato {contractLabel}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-foreground">
          {fmtBRL(client.value)}
        </p>
        <p className="text-[10px] font-medium text-[#D84040]">{overdueLabel}</p>
      </div>
    </>
  );

  if (locked) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onOpen} className={className}>
      {content}
    </button>
  );
}
