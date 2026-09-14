import type { ReactNode } from "react";
import { formatCpf } from "@/lib/format/tax-id";
import { cn, fmtBRL } from "@/lib/utils";

export function OriginacaoToneBadge({
  tone,
  children,
}: {
  tone: "warning" | "success";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone === "warning"
          ? "bg-warning-bg text-warning"
          : "bg-success-bg text-success",
      )}
    >
      {children}
    </span>
  );
}

interface OriginacaoSnapshotCardProps {
  badge: ReactNode;
  timestamp: string;
  name: string;
  amount: number;
  subtitle: string;
  cpf: string;
  children?: ReactNode;
}

export function OriginacaoSnapshotCard({
  badge,
  timestamp,
  name,
  amount,
  subtitle,
  cpf,
  children,
}: OriginacaoSnapshotCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        {badge}
        <span className="shrink-0 text-xs text-muted-foreground">
          {timestamp}
        </span>
      </div>
      <div>
        <p className="font-display text-base font-bold text-foreground">
          {name}
        </p>
        <p className="font-display text-lg font-bold text-foreground">
          {fmtBRL(amount)}
        </p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          CPF {formatCpf(cpf)}
        </p>
      </div>
      {children}
    </div>
  );
}
