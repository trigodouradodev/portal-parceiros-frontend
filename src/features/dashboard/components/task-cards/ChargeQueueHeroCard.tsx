import { MapPin, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/utils/map-queue-display";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

interface ChargeQueueHeroCardProps {
  display: ChargeQueueDisplayItem;
  taskChannel?: ActivityChannel;
  onWhatsApp: () => void;
  onCall: () => void;
  onVisit: () => void;
  onOpen: () => void;
}

/** Card expandido do 1º item acionável da fila (AUREA-186). */
export function ChargeQueueHeroCard({
  display,
  taskChannel,
  onWhatsApp,
  onCall,
  onVisit,
  onOpen,
}: ChargeQueueHeroCardProps) {
  const { client, segment, queuePosition } = display;
  const initials = getInitials(client.name);
  const parcelaLabel = client.parcela.replace(/^Parc\.?\s*/i, "Parc ");
  const isVisitTask = taskChannel === ActivityChannel.CLIENT_VISIT;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-white shadow-sm border-l-4 ${segment.borderClassName}`}
    >
      <button type="button" onClick={onOpen} className="w-full p-4 text-left">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${segment.badgeClassName}`}
          >
            {segment.label}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            #{queuePosition} — próximo da fila
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-foreground">
              {client.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {display.contractSubtitle}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{display.overdueInstallmentCount} parc. em atraso</span>
          <span className="text-[#D8D9E0]">·</span>
          <span>
            Total:{" "}
            <span className="font-semibold text-foreground">
              {fmtBRL(display.consolidatedOverdueAmount)}
            </span>
          </span>
          <span className="text-[#D8D9E0]">·</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${segment.badgeClassName}`}
          >
            {display.toneLabel}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Valor da parcela
            </p>
            <p className="font-fraunces text-xl font-bold text-foreground">
              {fmtBRL(display.originalAmount)}
            </p>
            <p className="text-xs text-muted-foreground">{parcelaLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Corrigido hoje
            </p>
            <p className="font-fraunces text-xl font-bold text-[#1D9E75]">
              {fmtBRL(display.correctedAmount)}
            </p>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        {isVisitTask ? (
          <Button
            type="button"
            className="h-10 w-full gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"
            onClick={onVisit}
          >
            <MapPin size={16} />
            Registrar visita
          </Button>
        ) : (
          <>
            <Button
              type="button"
              className="h-10 flex-1 gap-2 bg-[#1D9E75] text-white hover:bg-[#178a65]"
              onClick={onWhatsApp}
            >
              <MessageSquare size={16} />
              WhatsApp
            </Button>
            <Button
              type="button"
              className="h-10 flex-1 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"
              onClick={onCall}
            >
              <Phone size={16} />
              Ligar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
