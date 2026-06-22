import { ChevronRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user-display";
import { fmtBRL } from "@/lib/utils";
import { type PrevClient } from "@/features/dashboard/mocks/tasks";

export function PrevTaskCard({
  client,
  onOpen,
  onAction,
}: {
  client: PrevClient;
  onOpen: () => void;
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
