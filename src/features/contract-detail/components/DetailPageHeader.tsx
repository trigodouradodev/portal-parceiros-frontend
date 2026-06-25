import { ArrowLeft } from "lucide-react";
import type { ContractDetailView } from "@/features/contract-detail/types";
import { cn } from "@/lib/utils";

const statusBadgeStyle: Record<ContractDetailView["statusColor"], string> = {
  blue: "bg-brand-yellow/20 text-brand-navy",
  amber: "bg-[#FDF3E0] text-[#854F0B]",
  red: "bg-[#FEECEC] text-[#A32D2D]",
  green: "bg-[#E6F7F1] text-[#0F6E56]",
};

interface DetailPageHeaderProps {
  detail: ContractDetailView;
  partnerName?: string;
  onBack: () => void;
}

export function DetailPageHeader({
  detail,
  partnerName,
  onBack,
}: DetailPageHeaderProps) {
  const { businessName, contractCode, statusLabel, statusColor } = detail;

  return (
    <div className="bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Contratos
        </button>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-fraunces text-2xl font-bold leading-tight text-white md:text-3xl">
            {businessName}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {contractCode}
            {partnerName ? ` · Parceiro ${partnerName}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            statusBadgeStyle[statusColor],
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
