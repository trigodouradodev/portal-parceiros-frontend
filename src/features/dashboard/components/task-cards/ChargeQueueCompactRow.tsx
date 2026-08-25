import { CalendarClock, CalendarDays, ChevronDown, Lock } from "lucide-react";
import { InitialsAvatar } from "@/features/dashboard/components/task-cards/InitialsAvatar";
import { getInitials } from "@/lib/user-display";
import { cn, fmtBRL } from "@/lib/utils";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";

export const QUEUE_HIGHLIGHT_ATTR = "data-queue-highlight-id";

interface ChargeQueueCompactRowProps {
  display: ChargeQueueDisplayItem;
  locked: boolean;
  onOpen: () => void;
  installmentId: string;
  highlighted?: boolean;
  /** Executável mas recolhida (segmento ativo): mostra seta de "expandir" em vez do cadeado (AUREA-319). */
  expandable?: boolean;
}

/** Espelha LockedCobrQueueCard de portal-parceiros-design. */
export function ChargeQueueCompactRow({
  display,
  locked,
  onOpen,
  installmentId,
  highlighted = false,
  expandable = false,
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

  const className = cn(
    "overflow-hidden rounded-xl border transition-all duration-700",
    highlighted
      ? "border-brand-yellow bg-brand-yellow/15 opacity-100 ring-2 ring-brand-yellow ring-offset-2"
      : "border-[#E2E4EC] bg-white",
    locked && "cursor-default select-none",
    !locked && "text-left",
  );

  const highlightProps = {
    [QUEUE_HIGHLIGHT_ATTR]: installmentId,
  };

  const content = (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="flex w-5 shrink-0 flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold text-[#9DA3B4]">
          #{queuePosition}
        </span>
        {locked && <Lock size={10} className="text-[#C8CBD8]" />}
        {expandable && <ChevronDown size={10} className="text-brand-navy/50" />}
      </div>

      <InitialsAvatar initials={initials} size="sm" variant="muted" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-[#374151]">
            {client.name}
          </p>
          {wasPostponed && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#FDF3E0] px-1.5 py-0.5 text-[9px] text-[#BA7517]">
              <CalendarClock size={8} /> Postergado · amanhã
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
        <p className="truncate text-xs text-[#9DA3B4]">
          {display.pendingActionLabel} ·{" "}
          {contractLabel.toLowerCase().startsWith("contrato")
            ? contractLabel
            : `Contrato ${contractLabel}`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-[#374151]">
          {fmtBRL(client.value)}
        </p>
        <p className="text-[10px] text-[#9DA3B4]">{overdueLabel}</p>
      </div>
    </div>
  );

  const borderStyle = {
    borderLeftColor: segment.borderColor,
    borderLeftWidth: 3,
  };

  // AUREA-319: mesmo travada, o toque chama `onOpen` — quem chama decide o
  // que fazer (o guard de fila mostra o toast explicando o motivo do bloqueio
  // em vez de deixar o toque sem nenhuma resposta).
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(className, "w-full")}
      style={borderStyle}
      {...highlightProps}
    >
      {content}
    </button>
  );
}
