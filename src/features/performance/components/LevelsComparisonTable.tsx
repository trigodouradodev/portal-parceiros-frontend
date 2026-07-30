import { useMemo } from "react";
import { buildLevelComparisonRows } from "@/features/performance/utils/build-level-comparison-rows";
import { fmtBRL } from "@/lib/utils";
import type { PartnerProgram } from "@/services/performance/performance.types";

interface LevelsComparisonTableProps {
  program: PartnerProgram;
  currentLevelKey: string;
}

export function LevelsComparisonTable({
  program,
  currentLevelKey,
}: LevelsComparisonTableProps) {
  const { rows, permanenceHorizonMonths } = useMemo(
    () => buildLevelComparisonRows(program, currentLevelKey),
    [program, currentLevelKey],
  );

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
              <th className="px-3 pb-2 text-right font-semibold">
                Boas-vindas
              </th>
              <th className="px-3 pb-2 text-right font-semibold">
                + Desembolso
              </th>
              <th className="px-3 pb-2 text-right font-semibold">+ Risco</th>
              <th className="px-3 pb-2 text-right font-semibold">+ Taxa</th>
              <th className="px-3 pb-2 text-right font-semibold">
                Total mês 1 (máx.)
              </th>
              <th className="pb-2 pl-3 text-right font-semibold">
                Permanência {permanenceHorizonMonths}m
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-t border-[#EBEDF3] ${row.isCurrent ? "bg-brand-yellow/10" : ""}`}
              >
                <td
                  className={`py-2.5 pr-3 font-bold ${row.isCurrent ? "text-brand-navy" : "text-[#1A1D2E]"}`}
                >
                  {row.label}
                  {row.isCurrent && (
                    <span className="ml-1.5 align-middle rounded-full bg-brand-navy px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                      você
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                  {fmtBRL(row.monthlyTarget)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                  {fmtBRL(row.monthlyFixed)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                  {fmtBRL(row.welcomeBonus)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                  {fmtBRL(row.disbursementBonus)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                  {fmtBRL(row.riskBonus)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#1A1D2E]">
                  {fmtBRL(row.rateBonus)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono-dm font-bold text-[#1A1D2E]">
                  {fmtBRL(row.totalMonth1Max)}
                </td>
                <td className="py-2.5 pl-3 text-right text-[#1A1D2E]">
                  {fmtBRL(row.permanenceTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
