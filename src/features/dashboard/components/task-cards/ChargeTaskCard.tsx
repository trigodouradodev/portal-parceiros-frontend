import {
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import { ChargeTaskPipeline } from "@/features/dashboard/components/task-cards/ChargeTaskPipeline";
import { getChannelActionButtonLabel } from "@/features/dashboard/utils/charge-channel";
import { getStageToneMeta } from "@/features/dashboard/utils/collection-stage";
import type { ChargeClient } from "@/features/dashboard/mocks/tasks";
import {
  ActivityChannel,
  type ActivityTaskStatus,
} from "@/services/dashboard/dashboard.types";

export function ChargeTaskCard({
  client,
  taskChannel,
  taskStatus = "pending",
  canRegister = true,
  onOpen,
  onAction,
}: {
  client: ChargeClient;
  taskChannel?: ActivityChannel;
  taskStatus?: ActivityTaskStatus;
  canRegister?: boolean;
  onOpen: () => void;
  onAction: () => void;
}) {
  const toneMeta = getStageToneMeta(
    client.stageCode,
    client.reguaBadge?.label,
  );
  const toneColor = toneMeta?.chipClassName ?? "bg-muted text-muted-foreground";
  const overdueLabel = `${client.overdueDays}d atraso`;
  const initials = getInitials(client.name);
  const actionLabel = taskChannel
    ? getChannelActionButtonLabel(taskChannel)
    : "Registrar ação";

  const ActionIcon =
    taskChannel === ActivityChannel.WHATSAPP_MESSAGE
      ? MessageSquare
      : taskChannel === ActivityChannel.CLIENT_VISIT
        ? MapPin
        : Phone;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E4EC] bg-white shadow-sm">
      <button type="button" onClick={onOpen} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-navy">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {client.name}
            </p>
            <p className="truncate text-xs text-[#9DA3B4]">{client.contract}</p>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneColor}`}
          >
            <AlertTriangle size={9} />
            {overdueLabel}
          </span>
        </div>

        {taskChannel && (
          <ChargeTaskPipeline channel={taskChannel} status={taskStatus} />
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-fraunces text-xl font-bold leading-tight text-foreground">
              {fmtBRL(client.value)}
            </p>
            <p className="mt-0.5 text-xs text-[#9DA3B4]">{client.parcela}</p>
          </div>
          <div className="mb-1 flex shrink-0 items-center gap-2">
            {toneMeta && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${toneColor}`}
              >
                {toneMeta.chipLabel}
              </span>
            )}
            <ChevronRight size={16} className="text-[#C8CBD8]" />
          </div>
        </div>

        {client.lastAction && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9DA3B4]" />
            <p className="truncate text-xs text-[#9DA3B4]">
              {client.lastAction}
            </p>
          </div>
        )}
      </button>

      <div className="border-t border-[#F0F1F5] px-4 pb-3 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-full gap-1.5 text-xs"
          disabled={!canRegister}
          onClick={onAction}
        >
          <ActionIcon size={11} className="text-[#BA7517]" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
