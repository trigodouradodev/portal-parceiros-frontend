import type { LucideIcon } from "lucide-react";
import { ICON_CIRCLE, type KpiTone } from "@/features/carteira/utils/kpi";

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
      className="flex flex-col gap-2 rounded-2xl border border-[#D6D9E3] bg-white p-4 text-left shadow transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_CIRCLE[tone]}`}
        >
          <Icon size={16} />
        </div>
        <span className="text-xs font-semibold text-[#4B5165]">{label}</span>
      </div>
      <span className="font-fraunces text-xl leading-tight font-bold text-[#1A1D2E]">
        {value}
      </span>
      <span className="text-[11px] leading-snug text-[#9DA3B4]">{sub}</span>
    </button>
  );
}
