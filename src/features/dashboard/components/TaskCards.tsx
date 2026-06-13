import {
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { stageBadgeVariant } from "@/lib/stage-badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import {
  STAGE_INFO,
  type CobrClient,
  type CobrStage,
  type PrevClient,
} from "@/features/dashboard/mocks/tasks";

export function CobrTaskCard({
  client,
  stage,
  onAction,
}: {
  client: CobrClient;
  stage: CobrStage;
  onAction: () => void;
}) {
  const info = STAGE_INFO[stage];
  const badgeVariant = stageBadgeVariant(info.color);
  const overdueLabel = `${client.overdueDays}d atraso`;
  const initials = getInitials(client.name);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="w-full p-4 text-left">
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
            {info.label}
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

        {client.lastAction && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#BA7517]" />
            <p className="truncate text-xs text-muted-foreground">
              {client.lastAction}
            </p>
          </div>
        )}
      </div>

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

export function PrevTaskCard({
  client,
  onAction,
}: {
  client: PrevClient;
  onAction: () => void;
}) {
  const daysVariant =
    client.daysUntilDue === 0
      ? "red"
      : client.daysUntilDue === 2
        ? "amber"
        : "green";
  const daysLabel =
    client.daysUntilDue === 0
      ? "Vence hoje"
      : `Vence em ${client.daysUntilDue}d`;
  const initials = getInitials(client.name);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-navy">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {client.name}
            </p>
          </div>
          <Badge variant={daysVariant} className="shrink-0 text-[10px]">
            {daysLabel}
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
              <span className="text-muted-foreground">Contato preventivo</span>
            </p>
          </div>
          <ChevronRight size={16} className="mb-1 shrink-0 text-input" />
        </div>
      </div>

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

export function DoneCard({
  name,
  contract,
  label,
  onReopen,
}: {
  name: string;
  contract: string;
  label: string;
  onReopen: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border border-l-4 border-l-[#1D9E75] bg-muted p-4 opacity-70">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-muted-foreground line-through">
          {name}
        </p>
        <p className="text-xs text-muted-foreground/80">{contract}</p>
        <div className="mt-1 flex items-center gap-1">
          <CheckCircle2 size={11} className="text-success" />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onReopen}
        className="shrink-0 text-[11px] text-muted-foreground/80 underline hover:text-muted-foreground"
      >
        Reabrir
      </button>
    </div>
  );
}
