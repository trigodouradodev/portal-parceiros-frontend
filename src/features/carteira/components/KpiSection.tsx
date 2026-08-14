import {
  AlertTriangle,
  FileText,
  FileWarning,
  Percent,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/features/carteira/components/KpiCard";
import { buildContractListPath } from "@/features/carteira/utils/contract-list-route";
import { fmtInt, fmtPct, inadTone } from "@/features/carteira/utils/kpi";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { getApiErrorMessage } from "@/lib/api/errors";
import { fmtBRL } from "@/lib/utils";
import type { CarteiraDrillDownFilter } from "@/services/contracts/contracts.types";

export function KpiSection() {
  const summaryQuery = usePortfolioSummary();
  const navigate = useNavigate();

  // AUREA-330: drill-down é tela própria (ContractListPage), não modal —
  // o clique navega em vez de abrir um Dialog.
  function openDrillDown(title: string, filter: CarteiraDrillDownFilter = {}) {
    navigate(buildContractListPath(title, filter));
  }

  if (summaryQuery.isPending) {
    return (
      <section>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-base font-semibold text-[#1A1D2E] md:text-lg">
            Carteira
          </span>
          <span className="text-xs text-[#9DA3B4]">
            Carregando indicadores…
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <section className="rounded-2xl border border-[#D6D9E3] bg-white px-4 py-6">
        <p className="text-sm text-[#A32D2D]">
          {getApiErrorMessage(
            summaryQuery.error,
            "Não foi possível carregar os indicadores da carteira.",
          )}
        </p>
      </section>
    );
  }

  const summary = summaryQuery.data;
  const percentTone = inadTone(summary.delinquency.rate);

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-base font-semibold text-[#1A1D2E] md:text-lg">
          Carteira
        </span>
        <span className="text-xs text-[#9DA3B4]">
          Visão consolidada dos seus contratos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard
          icon={Wallet}
          tone="neutral"
          label="Carteira Ativa (DC)"
          value={fmtBRL(summary.active.outstandingAmount)}
          sub="Total a receber da carteira ativa"
          onClick={() =>
            openDrillDown("Carteira Ativa (DC)", { onlyActive: true })
          }
        />
        <KpiCard
          icon={FileText}
          tone="neutral"
          label="Contratos Ativos"
          value={fmtInt(summary.active.contracts)}
          sub="Com saldo pendente hoje"
          onClick={() =>
            openDrillDown("Contratos Ativos", { onlyActive: true })
          }
        />
        <KpiCard
          icon={Percent}
          tone={percentTone}
          label="% de Inadimplência"
          value={fmtPct(summary.delinquency.rate)}
          sub="Regra do vagão · contratos 30d+"
          onClick={() =>
            openDrillDown("Contratos em Inadimplência", {
              onlyDelinquency: true,
            })
          }
        />
        <KpiCard
          icon={AlertTriangle}
          tone={percentTone}
          label="Valor da Inadimplência"
          value={fmtBRL(summary.delinquency.amount)}
          sub="Saldo arrastado pela regra do vagão"
          onClick={() =>
            openDrillDown("Contratos em Inadimplência", {
              onlyDelinquency: true,
            })
          }
        />
        <KpiCard
          icon={FileWarning}
          tone={percentTone}
          label="Contratos com Inadimplência"
          value={fmtInt(summary.delinquency.contracts)}
          sub="Parcela vencida há mais de 30 dias"
          onClick={() =>
            openDrillDown("Contratos em Inadimplência", {
              onlyDelinquency: true,
            })
          }
        />
        <KpiCard
          icon={RefreshCw}
          tone="neutral"
          label="Saldo Renegociado"
          value={fmtBRL(summary.renegotiatedOutstandingAmount)}
          sub="Contratos com condições reestruturadas"
          onClick={() =>
            openDrillDown("Contratos Renegociados", {
              onlyRenegotiated: true,
            })
          }
        />
      </div>
    </section>
  );
}
