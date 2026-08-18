import { SectionPlaceholder } from "@/features/originacao/components/SectionPlaceholder";
import { useOriginacao } from "@/features/originacao/originacao-context";

export function PropostaPage() {
  const { propostaSimulacao } = useOriginacao();

  if (!propostaSimulacao) {
    return (
      <div className="flex-1 px-5 pt-5 pb-24 md:px-8 md:pb-8">
        <div className="max-w-xl rounded-2xl border border-[#E2E4EC] bg-white p-6 text-center shadow-sm">
          <p className="font-fraunces mb-1 text-lg font-bold text-[#1A1D2E]">
            Nenhuma simulação encontrada
          </p>
          <p className="text-sm text-[#6B7080]">
            Conclua uma simulação para iniciar uma proposta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SectionPlaceholder
      title="Proposta"
      description="Preenchimento completo da proposta com base na simulação selecionada."
    />
  );
}
