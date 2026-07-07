import { Lock } from "lucide-react";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/utils/map-queue-display";

interface ChargeQueueCompactRowProps {
  display: ChargeQueueDisplayItem;
  locked?: boolean;
  onOpen: () => void;
}

/** Linha compacta bloqueada da fila de cobrança (AUREA-186). */
export function ChargeQueueCompactRow({
  display,
  locked = true,
  onOpen,
}: ChargeQueueCompactRowProps) {
  const { client, segment, queuePosition } = display;
  const initials = getInitials(client.name);
  const overdueLabel = `${client.overdueDays}d atraso`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-xl border border-border bg-white px-3 py-3 text-left shadow-sm transition-opacity border-l-4 ${segment.borderClassName} ${
        locked ? "opacity-75" : ""
      }`}
    >
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
        <p className="truncate text-sm font-semibold text-foreground">
          {client.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {display.pendingActionLabel} — Contrato{" "}
          {display.client.contract.startsWith("#")
            ? display.client.contract
            : `#${display.client.contract}`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-foreground">
          {fmtBRL(client.value)}
        </p>
        <p className="text-[10px] font-medium text-[#D84040]">{overdueLabel}</p>
      </div>
    </button>
  );
}
