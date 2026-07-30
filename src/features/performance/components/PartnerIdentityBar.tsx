import { getInitials } from "@/lib/user-display";
import type { PartnerProfile } from "@/services/performance/performance.types";

interface PartnerIdentityBarProps {
  profile: PartnerProfile;
}

function formatSinceShort(startedAt: string): string {
  // 'YYYY-MM-DD' → 'MM/AA'
  const [year, month] = startedAt.split("-");
  if (!year || !month) return startedAt;
  return `${month}/${year.slice(2)}`;
}

export function PartnerIdentityBar({ profile }: PartnerIdentityBarProps) {
  const { partner, level, partnership } = profile;

  return (
    <div className="rounded-2xl border border-[#D6D9E3] bg-white px-5 py-4 shadow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
            {getInitials(partner.fullName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1A1D2E]">
              {partner.fullName}
            </p>
            {partner.roleLabel && (
              <p className="truncate text-xs text-[#6B7080]">
                {partner.roleLabel}
              </p>
            )}
            <p className="truncate text-xs text-[#6B7080]">
              Parceiro desde {formatSinceShort(partnership.startedAt)}
            </p>
          </div>
        </div>
        <span className="inline-block shrink-0 rounded-full bg-brand-navy px-3 py-1.5 text-xs font-bold text-white">
          Nível {level.label}
        </span>
      </div>
    </div>
  );
}
