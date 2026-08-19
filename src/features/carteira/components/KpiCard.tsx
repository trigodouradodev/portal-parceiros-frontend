import type { LucideIcon } from "lucide-react";
import {
  ICON_CIRCLE,
  TONE_TEXT,
  type KpiTone,
} from "@/features/carteira/utils/kpi";

interface KpiCardProps {
  icon: LucideIcon;
  tone: KpiTone;
  label: string;
  value: string;
  sub: string;
  onClick: () => void;
}

export function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  onClick,
}: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_CIRCLE[tone]}`}
        >
          <Icon size={16} />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="font-fraunces text-xl leading-tight font-bold text-foreground">
        {value}
      </span>
      <span className={`text-xs opacity-90 ${TONE_TEXT[tone]}`}>{sub}</span>
    </button>
  );
}
