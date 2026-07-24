import {
  currentPartner,
  LEVELS,
  WELCOME_BONUS,
  type PartnerLevel,
} from "@/features/performance/data/commission";
import { fmtBRL } from "@/lib/utils";

export function LevelsComparisonTable() {
  const currentLevel = currentPartner.level;

  return (
    <div className="rounded-2xl border border-[#D6D9E3] bg-white p-5 shadow">
      <p className="mb-4 text-base font-semibold text-[#1A1D2E] md:text-lg">
        Quanto ganharia em cada nível (performance máxima)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="text-[10px] tracking-wide text-[#4B5165] uppercase">
              <th className="pb-2 pr-3 text-left font-semibold">Nível</th>
              <th className="px-3 pb-2 text-right font-semibold">Meta/mês</th>
              <th className="px-3 pb-2 text-right font-semibold">Fixo/mês</th>
              <th className="px-3 pb-2 text-right font-semibold">Boas-vindas</th>
              <th className="px-3 pb-2 text-right font-semibold">+ Desembolso</th>
              <th className="px-3 pb-2 text-right font-semibold">+ Risco</th>
              <th className="px-3 pb-2 text-right font-semibold">+ Taxa</th>
              <th className="px-3 pb-2 text-right font-semibold">
                Total mês 1 (máx.)
              </th>
              <th className="pb-2 pl-3 text-right font-semibold">
                Permanência 18m
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(LEVELS) as PartnerLevel[]).map((key) => {
              const l = LEVELS[key];
              const maxBonus =
                0.2 * l.fixo + 0.5 * l.fixo + 0.3 * l.fixo;
              const totalMes1 = l.fixo + WELCOME_BONUS + maxBonus;
              const perm18 = 6 * l.fixo;
              const isCurrent = key === currentLevel;
              return (
                <tr
                  key={key}
                  className={`border-t border-[#EBEDF3] ${isCurrent ? "bg-brand-yellow/10" : ""}`}
                >
                  <td
                    className={`py-2.5 pr-3 font-bold ${isCurrent ? "text-brand-navy" : "text-[#1A1D2E]"}`}
                  >
                    {l.label}
                    {isCurrent && (
                      <span className="ml-1.5 align-middle rounded-full bg-brand-navy px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                        você
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                    {fmtBRL(l.meta)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                    {fmtBRL(l.fixo)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                    {fmtBRL(WELCOME_BONUS)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                    {fmtBRL(0.2 * l.fixo)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                    {fmtBRL(0.5 * l.fixo)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                    {fmtBRL(0.3 * l.fixo)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-dm font-bold text-[#1A1D2E]">
                    {fmtBRL(totalMes1)}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-[#1A1D2E]">
                    {fmtBRL(perm18)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
