import { AlertTriangle, ChevronRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { stageBadgeVariant } from "@/lib/stage-badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import {
  STAGE_INFO,
  type ChargeClient,
  type ChargeStage,
} from "@/features/dashboard/mocks/tasks";

export function ChargeTaskCard({
  client,
  stage,
  onOpen,
  onAction,
}: {
  client: ChargeClient;
  stage: ChargeStage;
  onOpen: () => void;
  onAction: () => void;
}) {
  const info = STAGE_INFO[stage];
  const badgeLabel = client.reguaBadge?.label ?? info.label;
  const badgeVariant = stageBadgeVariant(
    client.reguaBadge?.color ?? info.color,
  );
  const overdueLabel = `${client.overdueDays}d atraso`;
  const initials = getInitials(client.name);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-1 flex-col p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-navy">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {client.name}
            </p>
          </div>
          <Badge variant={badgeVariant} className="shrink-0 text-[10px]">
            <AlertTriangle size={9} />
            {badgeLabel}
          </Badge>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-mono-dm font-fraunces text-xl font-bold leading-tight text-foreground">
              {fmtBRL(client.value)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/80">
              {client.parcela}
              <span className="mx-1.5 text-[#D8D9E0]">·</span>
              <span className="font-medium text-[#D84040]">{overdueLabel}</span>
            </p>
          </div>
          <ChevronRight size={16} className="mb-1 shrink-0 text-input" />
        </div>

        <div className="mt-2.5 flex min-h-[1.25rem] items-center gap-1.5">
          {client.lastAction && (
            <>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#BA7517]" />
              <p className="truncate text-xs text-muted-foreground">
                {client.lastAction}
              </p>
            </>
          )}
        </div>
      </button>

      <div className="border-t border-muted px-4 pb-3 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-full gap-1.5 text-xs"
          onClick={onAction}
        >
          <MapPin size={11} className="text-[#BA7517]" />
          Registrar ação
        </Button>
      </div>
    </div>
  );
}
