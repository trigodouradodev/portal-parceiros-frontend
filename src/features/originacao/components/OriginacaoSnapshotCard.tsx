import type { ReactNode } from "react";
import { formatCpf } from "@/lib/format/tax-id";
import { cn, fmtBRL } from "@/lib/utils";
import { getQuoteStatusPresentation } from "@/services/quotes/quotes.status";

export type OriginacaoTone =
  | "muted"
  | "warning"
  | "info"
  | "success"
  | "destructive";

const TONE_CLASS: Record<OriginacaoTone, string> = {
  muted: "bg-muted text-muted-foreground",
  warning: "bg-warning-bg text-warning",
  info: "bg-brand-navy/5 text-brand-navy",
  success: "bg-success-bg text-success",
  destructive: "bg-destructive-bg text-destructive",
};

export function OriginacaoToneBadge({
  tone,
  children,
}: {
  tone: OriginacaoTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        TONE_CLASS[tone],
      )}
    >
      {children}
    </span>
  );
}

export function QuoteStatusBadge({ status }: { status: string }) {
  const { label, badgeClassName } = getQuoteStatusPresentation(status);
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        badgeClassName,
      )}
    >
      {label}
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
