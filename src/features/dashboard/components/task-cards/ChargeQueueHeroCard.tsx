import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/features/dashboard/components/task-cards/InitialsAvatar";
import { PostponeControl } from "@/features/dashboard/components/task-cards/PostponeControl";
import { QueuePositionBar } from "@/features/dashboard/components/task-cards/QueuePositionBar";
import { TaskTypeBadge } from "@/features/dashboard/components/task-cards/TaskTypeBadge";
import { TonePill } from "@/features/dashboard/components/task-cards/TonePill";
import { VisitRescheduleDialog } from "@/features/dashboard/components/task-cards/VisitRescheduleDialog";
import {
  getVisitRescheduleBounds,
  VISIT_RESCHEDULE_WINDOW_DAYS,
} from "@/features/dashboard/constants/visit-reschedule";
import { QUEUE_TONE_CORRECTED_CLASS } from "@/features/dashboard/constants/charge-queue-tone";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

interface ChargeQueueHeroCardProps {
  display: ChargeQueueDisplayItem;
  taskChannel?: ActivityChannel;
  queueTotal?: number;
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

/** Espelha ActiveCobrQueueCard de portal-parceiros-design. */
export function ChargeQueueHeroCard({
  display,
  taskChannel,
  queueTotal,
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
  const [draftVisitDate, setDraftVisitDate] = useState<Date | undefined>();
  const {
    client,
    segment,
    queuePosition,
    tone,
    toneLabel,
    rescheduledDateLabel,
    wasRescheduled,
    lastActionNote,
  } = display;
  const initials = getInitials(client.name);
  const parcelaLabel = client.parcela.replace(/^Parc\.?\s*/i, "Parc ");
  const isVisitTask = taskChannel === ActivityChannel.CLIENT_VISIT;
  const corrBg = QUEUE_TONE_CORRECTED_CLASS[tone];
  const { min, max } = getVisitRescheduleBounds();

  const handleConfirmPostpone = () => {
    setConfirmingPostpone(false);
    onPostpone();
  };

  const handleRescheduleOpenChange = (open: boolean) => {
    setRescheduleOpen(open);
    if (!open) setDraftVisitDate(undefined);
  };

  const openPostponeConfirm = () => setConfirmingPostpone(true);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border-2 border-brand-navy bg-white shadow-md">
        <QueuePositionBar
          position={queuePosition}
          total={queueTotal}
          segmentLabel={segment.label}
          segmentBadgeClassName={segment.badgeClassName}
        />

        <button type="button" onClick={onOpen} className="w-full p-4 text-left">
          <div className="flex items-center gap-3">
            <InitialsAvatar initials={initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1A1D2E]">
                {client.name}
              </p>
              <p className="truncate text-xs text-[#6B7080]">
                {display.contractSubtitle}
              </p>
            </div>
            <TonePill
              tone={tone}
              withAlertIcon
              className="shrink-0 rounded-full px-2 font-semibold"
            >
              {client.overdueDays}d
            </TonePill>
          </div>

          <div className="mt-3">
            <TaskTypeBadge isVisit={isVisitTask} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <TonePill tone={tone} className="font-bold">
                {display.overdueInstallmentCount} parc. em atraso
              </TonePill>
              <span className="text-[10px] text-[#9DA3B4]">·</span>
              <span className="text-[10px] font-medium text-[#6B7080]">
                Total:{" "}
                <span className="font-semibold text-[#1A1D2E]">
                  {fmtBRL(display.consolidatedOverdueAmount)}
                </span>
              </span>
            </div>
            <TonePill tone={tone} className="shrink-0 font-medium">
              {toneLabel}
            </TonePill>
          </div>

          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div>
              <p className="mb-0.5 text-[10px] text-[#9DA3B4]">
                Valor da parcela
              </p>
              <p className="font-fraunces text-xl font-bold leading-tight text-[#1A1D2E]">
                {fmtBRL(display.originalAmount)}
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#6B7080]">
                {parcelaLabel}
              </p>
            </div>
            <div className="mb-0.5 flex flex-col items-end gap-1">
              <p className="text-[10px] text-[#9DA3B4]">Corrigido hoje</p>
              <span
                className={`rounded-lg px-2 py-1 font-fraunces text-xl font-bold leading-tight ${corrBg}`}
              >
                {fmtBRL(display.correctedAmount)}
              </span>
            </div>
          </div>

          {lastActionNote && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8CBD8]" />
              <p className="truncate text-xs text-[#6B7080]">{lastActionNote}</p>
            </div>
          )}
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
          <div className="flex flex-col gap-2 border-t border-[#F0F1F5] px-4 pb-3 pt-1">
            <div className="flex gap-2">
              {isVisitTask ? (
                <Button
                  type="button"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 bg-brand-navy text-xs text-white hover:bg-brand-navy/90"
                  onClick={onVisit}
                >
                  <MapPin size={11} />
                  Registrar Visita
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 flex-1 gap-1.5 bg-[#25D366] text-xs text-white hover:bg-[#1ebe5a]"
                    onClick={onWhatsApp}
                  >
                    <MessageSquare size={11} />
                    WhatsApp
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 flex-1 gap-1.5 bg-brand-navy text-xs text-white hover:bg-brand-navy/90"
                    onClick={onCall}
                  >
                    <Phone size={11} />
                    Ligar
                  </Button>
                  <PostponeControl
                    canPostpone={canPostpone}
                    onPostponeClick={openPostponeConfirm}
                    buttonClassName="h-9 gap-1 border-[#E2E4EC] px-3 text-xs text-[#6B7080] hover:border-[#F5C37A] hover:text-[#854F0B]"
                  />
                </>
              )}
            </div>

            {isVisitTask && (
              <div className="flex justify-end gap-2">
                {canRescheduleVisit ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 gap-1 border-[#E2E4EC] px-3 text-xs text-[#6B7080] hover:border-brand-navy hover:text-brand-navy"
                    onClick={() => {
                      setDraftVisitDate(undefined);
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
                  buttonClassName="h-9 gap-1 border-[#E2E4EC] px-3 text-xs text-[#6B7080] hover:border-[#F5C37A] hover:text-[#854F0B]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {isVisitTask && (
        <VisitRescheduleDialog
          open={rescheduleOpen}
          onOpenChange={handleRescheduleOpenChange}
          draftDate={draftVisitDate}
          onDraftDateChange={setDraftVisitDate}
          minDate={min}
          maxDate={max}
          isRescheduling={isRescheduling}
          onConfirm={(isoDate) => {
            onRescheduleVisit(isoDate);
            setRescheduleOpen(false);
            setDraftVisitDate(undefined);
          }}
        />
      )}
    </>
  );
}
