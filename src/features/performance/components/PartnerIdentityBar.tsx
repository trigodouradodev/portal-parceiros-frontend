import {
  currentPartner,
  LEVELS,
} from "@/features/performance/data/commission";

export function PartnerIdentityBar() {
  const p = currentPartner;
  const lvl = LEVELS[p.level];

  return (
    <div className="rounded-2xl border border-[#D6D9E3] bg-white px-5 py-4 shadow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
            {p.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1A1D2E]">
              {p.name}
            </p>
            <p className="truncate text-xs text-[#6B7080]">{p.role}</p>
            <p className="truncate text-xs text-[#6B7080]">
              Parceiro desde {p.sinceShort}
            </p>
          </div>
        </div>
        <span className="inline-block shrink-0 rounded-full bg-brand-navy px-3 py-1.5 text-xs font-bold text-white">
          Nível {lvl.label}
        </span>
      </div>
    </div>
  );
}
