import { fmtBRL } from "@/lib/utils";

const COMMISSION_ITEMS = [
  { label: "Originação · 67% da meta (R$ 250k)", value: 2400 },
  { label: "Renovações · 75% vs meta 70%", value: 1100 },
  { label: "Inadimplência · 3,1% (dentro de 3,5%)", value: 780 },
];

const COMMISSION_TOTAL = 4280;
const COMMISSION_UNLOCK = {
  label: "Subir a taxa média ao piso (10,4%) destrava",
  value: 520,
};

export function CommissionSection() {
  return (
    <div className="px-5 pt-6 md:px-8">
      <div className="overflow-hidden rounded-2xl border border-border shadow-sm md:flex">
        <div className="flex flex-col justify-center bg-brand-navy px-6 py-6 md:w-64 md:shrink-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/60">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
              $
            </span>
            Sua comissão estimada · junho
          </div>
          <p className="font-fraunces text-3xl font-bold leading-none text-white">
            {fmtBRL(COMMISSION_TOTAL)}
          </p>
          <p className="mt-2 text-xs text-white/40">
            Prévia do mês · fecha em 30/06 conforme suas metas.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-3 bg-white px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Como sua comissão é formada
          </p>

          <div className="flex flex-col gap-2">
            {COMMISSION_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-sm text-[#1D9E75]">↗</span>
                  <span className="truncate text-sm text-foreground">
                    {item.label}
                  </span>
                </div>
                <span className="font-mono-dm shrink-0 text-sm font-semibold text-[#1D9E75]">
                  +{fmtBRL(item.value)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Total estimado
            </span>
            <span className="font-mono-dm text-sm font-bold text-foreground">
              {fmtBRL(COMMISSION_TOTAL)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-yellow/15 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm text-brand-navy">⇑</span>
              <span className="truncate text-xs font-medium text-brand-navy">
                {COMMISSION_UNLOCK.label}
              </span>
            </div>
            <span className="font-mono-dm shrink-0 text-sm font-semibold text-brand-navy">
              +{fmtBRL(COMMISSION_UNLOCK.value)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
