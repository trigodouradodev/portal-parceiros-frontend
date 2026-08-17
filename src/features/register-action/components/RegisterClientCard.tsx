import type { ActionClient } from "@/contexts/action/action-context";
import { getInitials } from "@/lib/user-display";

interface RegisterClientCardProps {
  client: ActionClient;
}

function formatContractLabel(contract: string): string {
  const trimmed = contract.trim();
  if (!trimmed) return trimmed;
  if (trimmed.toLowerCase().startsWith("contrato")) return trimmed;
  if (trimmed.startsWith("#")) return `Contrato ${trimmed}`;
  return `Contrato #${trimmed}`;
}

export function RegisterClientCard({ client }: RegisterClientCardProps) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
        {getInitials(client.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{client.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatContractLabel(client.contract)} · {client.daysInfo}
        </p>
      </div>
      <span className="shrink-0 font-mono-dm text-lg font-semibold text-foreground">
        {client.value}
      </span>
    </div>
  );
}
