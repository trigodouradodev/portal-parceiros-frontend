import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PostponeControl } from "@/features/dashboard/components/task-cards/PostponeControl";
import {
  getVisitRescheduleBounds,
  VISIT_RESCHEDULE_WINDOW_DAYS,
} from "@/features/dashboard/constants/visit-reschedule";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

interface ChargeQueueHeroCardProps {
  display: ChargeQueueDisplayItem;
  taskChannel?: ActivityChannel;
  canPostpone: boolean;
  canRescheduleVisit: boolean;
  onWhatsApp: () => void;
  onCall: () => void;
  onVisit: () => void;
  onOpen: () => void;
  onPostpone: () => void;
  onRescheduleVisit: (date: string) => void;
  isPostponing?: boolean;
  isRescheduling?: boolean;
}

function RescheduledVisitBadge({
  wasRescheduled,
  rescheduledDateLabel,
}: {
  wasRescheduled: boolean;
  rescheduledDateLabel?: string;
}) {
  if (!wasRescheduled) return null;

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-[#E6F7F1] px-2 text-[10px] text-[#0F6E56]">
      <CalendarDays size={11} />
      {rescheduledDateLabel
        ? `Reagendada · ${rescheduledDateLabel}`
        : "Reagendada"}
    </span>
  );
}

/** Card expandido do 1º item acionável da fila (AUREA-186 / AUREA-189). */
export function ChargeQueueHeroCard({
  display,
  taskChannel,
  canPostpone,
  canRescheduleVisit,
  onWhatsApp,
  onCall,
  onVisit,
  onOpen,
  onPostpone,
  onRescheduleVisit,
  isPostponing = false,
  isRescheduling = false,
}: ChargeQueueHeroCardProps) {
  const [confirmingPostpone, setConfirmingPostpone] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [draftVisitDate, setDraftVisitDate] = useState("");
  const { client, segment, queuePosition, rescheduledDateLabel, wasRescheduled } =
    display;
  const initials = getInitials(client.name);
  const parcelaLabel = client.parcela.replace(/^Parc\.?\s*/i, "Parc ");
  const isVisitTask = taskChannel === ActivityChannel.CLIENT_VISIT;
  const { minIso, maxIso } = getVisitRescheduleBounds();

  const handleConfirmPostpone = () => {
    setConfirmingPostpone(false);
    onPostpone();
  };

  const handleConfirmReschedule = () => {
    if (!draftVisitDate) return;
    onRescheduleVisit(draftVisitDate);
    setRescheduleOpen(false);
    setDraftVisitDate("");
  };

  const openPostponeConfirm = () => setConfirmingPostpone(true);

  return (
    <>
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

        {confirmingPostpone && (
          <div className="mx-4 mb-3 rounded-xl border border-[#F5C37A] bg-[#FDF3E0] p-3">
            <div className="mb-3 flex items-start gap-2">
              <CalendarClock
                size={15}
                className="mt-0.5 shrink-0 text-[#BA7517]"
              />
              <p className="text-xs font-medium leading-snug text-[#854F0B]">
                Você só pode postergar esta tarefa <strong>uma vez</strong>. Ela
                voltará ao topo da fila amanhã e não poderá ser postergada
                novamente.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 flex-1 border-[#F5C37A] text-xs text-[#854F0B]"
                onClick={() => setConfirmingPostpone(false)}
                disabled={isPostponing}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 flex-1 bg-[#BA7517] text-xs text-white hover:bg-[#9A6010]"
                onClick={handleConfirmPostpone}
                disabled={isPostponing}
              >
                {isPostponing ? "Postergando..." : "Confirmar postergação"}
              </Button>
            </div>
          </div>
        )}

        {!confirmingPostpone && (
          <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
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
                  <PostponeControl
                    canPostpone={canPostpone}
                    onPostponeClick={openPostponeConfirm}
                  />
                </>
              )}
            </div>

            {isVisitTask && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {canRescheduleVisit ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 gap-1 px-3 text-xs text-muted-foreground hover:border-brand-navy hover:text-brand-navy"
                    onClick={() => {
                      setDraftVisitDate("");
                      setRescheduleOpen(true);
                    }}
                    title={`Reagendar a visita para até ${VISIT_RESCHEDULE_WINDOW_DAYS} dias (apenas 1 vez)`}
                  >
                    <CalendarDays size={13} />
                    Reagendar · 1×
                  </Button>
                ) : (
                  <RescheduledVisitBadge
                    wasRescheduled={wasRescheduled}
                    rescheduledDateLabel={rescheduledDateLabel}
                  />
                )}
                <PostponeControl
                  canPostpone={canPostpone}
                  onPostponeClick={openPostponeConfirm}
                  buttonClassName="h-9 gap-1 px-3 text-xs text-muted-foreground hover:border-[#F5C37A] hover:text-[#854F0B]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {isVisitTask && (
        <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
          <DialogContent className="max-w-[340px]">
            <DialogHeader>
              <DialogTitle>Alterar data da visita</DialogTitle>
              <DialogDescription>
                Escolha uma nova data para a visita, entre amanhã e D+
                {VISIT_RESCHEDULE_WINDOW_DAYS}. Essa alteração só pode ser feita
                uma vez.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="date"
              min={minIso}
              max={maxIso}
              value={draftVisitDate}
              onChange={(event) => setDraftVisitDate(event.target.value)}
              className="h-10"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => setRescheduleOpen(false)}
                disabled={isRescheduling}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="h-10 rounded-xl bg-brand-navy font-semibold text-white"
                disabled={!draftVisitDate || isRescheduling}
                onClick={handleConfirmReschedule}
              >
                {isRescheduling ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
