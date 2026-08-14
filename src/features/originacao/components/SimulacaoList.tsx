import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { fmtBRL } from "@/lib/utils";
import type { SimulacaoSnapshot } from "@/features/originacao/types";

interface SimulacaoListProps {
  simulacoes: SimulacaoSnapshot[];
  onNovaSimulacao: () => void;
  onIniciarProposta: (snapshot: SimulacaoSnapshot) => void;
}

export function SimulacaoList({
  simulacoes,
  onNovaSimulacao,
  onIniciarProposta,
}: SimulacaoListProps) {
  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
            Simulações
          </h2>
          <p className="mt-1 text-sm text-[#6B7080]">
            Simulações realizadas para clientes nesta sessão.
          </p>
        </div>
        <Button
          variant="yellow"
          className="h-10 shrink-0 gap-1.5 rounded-2xl px-4"
          onClick={onNovaSimulacao}
        >
          <Plus size={15} />
          Nova simulação
        </Button>
      </div>

      {simulacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F6FA]">
            <Plus size={22} className="text-[#9DA3B4]" />
          </div>
          <p className="mb-1 font-semibold text-[#1A1D2E]">
            Nenhuma simulação ainda
          </p>
          <p className="text-sm text-[#9DA3B4]">
            Clique em &quot;Nova simulação&quot; para começar.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {[...simulacoes].reverse().map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#E2E4EC] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="inline-block rounded-full bg-[#FDF3E0] px-2 py-0.5 text-[11px] font-semibold text-[#854F0B]">
                {s.produto}
              </span>
              <span className="shrink-0 text-xs text-[#9DA3B4]">
                {s.criadaEm}
              </span>
            </div>
            <div>
              <p className="font-fraunces text-base font-bold text-[#1A1D2E]">
                {s.nome}
              </p>
              <p className="font-fraunces text-lg font-bold text-[#1A1D2E]">
                {fmtBRL(s.valor)}
              </p>
              <p className="text-sm text-[#6B7080]">
                {s.parcelas}x de {fmtBRL(s.parcelaCalc)} · vencimento dia{" "}
                {String(s.vencimento).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs text-[#9DA3B4]">
                CPF {formatCpf(s.cpf)}
              </p>
            </div>
            <Button
              variant="outline"
              className="h-10 rounded-2xl"
              onClick={() => onIniciarProposta(s)}
            >
              Iniciar proposta
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
