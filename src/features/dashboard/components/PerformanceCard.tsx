export interface PerfCardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  progress: number;
  status: "ok" | "warn";
  chip: string;
  chipVariant: "green" | "red" | "amber";
}

export function PerformanceCard({
  icon,
  label,
  value,
  sub,
  progress,
  status,
  chip,
  chipVariant,
}: PerfCardProps) {
  const barColor =
    status === "warn"
      ? "bg-[#D84040]"
      : progress >= 100
        ? "bg-brand-yellow"
        : "bg-[#1D9E75]";
  const chipStyle =
    chipVariant === "red"
      ? "bg-destructive-bg text-destructive"
      : chipVariant === "green"
        ? "bg-success-bg text-success"
        : "bg-warning-bg text-warning";

  return (
    <div className="flex w-52 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:w-auto">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      <div>
        <p className="font-fraunces text-2xl font-bold leading-tight text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">{sub}</p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div
        className={`flex items-start gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${chipStyle}`}
      >
        <span className="mt-0.5 shrink-0">→</span>
        <span>{chip}</span>
      </div>
    </div>
  );
}
