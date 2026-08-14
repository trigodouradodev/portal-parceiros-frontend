import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OriginacaoProgress } from "@/features/originacao/components/OriginacaoProgress";
import { ActivityIncomeSection } from "@/features/originacao/components/proposta/ActivityIncomeSection";
import { AddressSection } from "@/features/originacao/components/proposta/AddressSection";
import { DocumentsSection } from "@/features/originacao/components/proposta/DocumentsSection";
import { FinancialSection } from "@/features/originacao/components/proposta/FinancialSection";
import { GuarantorSection } from "@/features/originacao/components/proposta/GuarantorSection";
import { PartnerOpinionSection } from "@/features/originacao/components/proposta/PartnerOpinionSection";
import { RegistrationSection } from "@/features/originacao/components/proposta/RegistrationSection";
import { useOriginacao } from "@/features/originacao/originacao-context";
import {
  PROPOSAL_STEPS,
  type ProposalFormData,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { fmtBRL } from "@/lib/utils";
import type { SimulacaoSnapshot } from "@/features/originacao/types";

function StepHeader({ current }: { current: number }) {
  return (
    <div className="mb-4 rounded-2xl border border-[#E2E4EC] bg-white p-4 shadow-sm">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-bold text-brand-navy">
          Passo {current + 1} de {PROPOSAL_STEPS.length}
        </span>
        <span className="text-xs font-medium text-[#6B7080]">
          {PROPOSAL_STEPS[current]}
        </span>
      </div>
      <OriginacaoProgress
        value={((current + 1) / PROPOSAL_STEPS.length) * 100}
      />
    </div>
  );
}

function SimulationSummary({ simulation }: { simulation: SimulacaoSnapshot }) {
  return (
    <div className="mb-4 rounded-2xl bg-[#F5F6FA] px-4 py-3">
      <p className="text-xs text-[#6B7080]">Baseada na simulação</p>
      <p className="font-semibold text-[#1A1D2E]">
        {fmtBRL(simulation.valor)} em {simulation.parcelas}x de{" "}
        {fmtBRL(simulation.parcelaCalc)}
      </p>
      <p className="text-xs text-[#6B7080]">
        {simulation.produto} · CPF {formatCpf(simulation.cpf)}
      </p>
    </div>
  );
}

function ProposalList({
  proposals,
  onOpen,
}: {
  proposals: ProposalSnapshot[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div className="mb-6">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          Propostas
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">
          Propostas criadas nesta sessão — rascunhos podem ser retomados a
          qualquer momento.
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F6FA]">
            <FileText size={22} className="text-[#9DA3B4]" />
          </div>
          <p className="mb-1 font-semibold text-[#1A1D2E]">
            Nenhuma proposta ainda
          </p>
          <p className="text-sm text-[#9DA3B4]">
            Inicie uma proposta a partir de uma simulação concluída.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {[...proposals].reverse().map((proposal) => (
          <div
            key={proposal.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#E2E4EC] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  proposal.status === "draft"
                    ? "bg-[#FDF3E0] text-[#854F0B]"
                    : "bg-[#E6F7F1] text-[#0F6E56]"
                }`}
              >
                {proposal.status === "draft" ? "Rascunho" : "Concluída"}
              </span>
              <span className="shrink-0 text-xs text-[#9DA3B4]">
                {proposal.updatedAt}
              </span>
            </div>
            <div>
              <p className="font-fraunces text-base font-bold text-[#1A1D2E]">
                {proposal.simulation.nome}
              </p>
              <p className="font-fraunces text-lg font-bold text-[#1A1D2E]">
                {fmtBRL(proposal.simulation.valor)}
              </p>
              <p className="text-sm text-[#6B7080]">
                {proposal.simulation.parcelas}x de{" "}
                {fmtBRL(proposal.simulation.parcelaCalc)}
              </p>
              <p className="mt-1 text-xs text-[#9DA3B4]">
                CPF {formatCpf(proposal.simulation.cpf)}
              </p>
            </div>
            {proposal.status === "draft" ? (
              <>
                <OriginacaoProgress
                  value={((proposal.step + 1) / PROPOSAL_STEPS.length) * 100}
                />
                <p className="text-xs text-[#9DA3B4]">
                  Passo {proposal.step + 1} de {PROPOSAL_STEPS.length} ·{" "}
                  {PROPOSAL_STEPS[proposal.step]}
                </p>
                <Button
                  variant="outline"
                  className="h-10 rounded-2xl"
                  onClick={() => onOpen(proposal.id)}
                >
                  Continuar preenchimento
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="h-10 rounded-2xl"
                onClick={() => onOpen(proposal.id)}
              >
                Ver proposta
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalSuccess({
  proposal,
  onBackToList,
}: {
  proposal: ProposalSnapshot;
  onBackToList: () => void;
}) {
  const { simulation } = proposal;

  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <button
        type="button"
        onClick={onBackToList}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-brand-navy"
      >
        <ArrowLeft size={14} />
        Ver todas as propostas
      </button>

      <SimulationSummary simulation={simulation} />

      <section className="rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3">
          <Alert variant="success">
            <CheckCircle2 size={22} />
            <div>
              <AlertTitle>Proposta criada</AlertTitle>
              <AlertDescription>
                O cliente deve acessar o Portal do Cliente para revisar os
                dados, dar os consentimentos e concluir a aprovação.
              </AlertDescription>
            </div>
          </Alert>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
            onClick={() =>
              alert("Abrirá o WhatsApp com o link do Portal do Cliente.")
            }
          >
            <MessageSquare size={18} />
            Enviar link pelo WhatsApp
            <ExternalLink size={14} className="opacity-70" />
          </button>

          <Button
            variant="ghost"
            className="h-11 rounded-2xl"
            onClick={onBackToList}
          >
            Ver todas as propostas
          </Button>
        </div>
      </section>
    </div>
  );
}

export function PropostaPage() {
  const {
    proposals,
    openProposalId,
    openProposal,
    closeProposal,
    updateProposal,
  } = useOriginacao();

  const proposal = openProposalId
    ? (proposals.find((item) => item.id === openProposalId) ?? null)
    : null;

  if (!proposal) {
    return <ProposalList proposals={proposals} onOpen={openProposal} />;
  }

  if (proposal.status === "completed") {
    return <ProposalSuccess proposal={proposal} onBackToList={closeProposal} />;
  }

  const { simulation, data, step, stepValid } = proposal;

  function save(patch: Partial<ProposalSnapshot>) {
    updateProposal({
      ...proposal!,
      ...patch,
      updatedAt: new Date().toLocaleString("pt-BR"),
    });
  }

  function setSectionData<K extends keyof ProposalFormData>(
    key: K,
    value: ProposalFormData[K],
  ) {
    save({ data: { ...data, [key]: value } });
  }

  function setValidAt(index: number, valid: boolean) {
    if (stepValid[index] === valid) return;
    const next = [...stepValid];
    next[index] = valid;
    save({ stepValid: next });
  }

  function handleNext() {
    if (!stepValid[step]) return;
    if (step === PROPOSAL_STEPS.length - 1) {
      save({ status: "completed" });
    } else {
      save({ step: step + 1 });
    }
  }

  function handleBack() {
    save({ step: Math.max(0, step - 1) });
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div className="mb-4">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          Proposta
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">
          Preenchimento completo: cadastro, atividade e renda, endereço, parecer
          do parceiro, avalista, financeiro e documentação.
        </p>
      </div>

      <button
        type="button"
        onClick={closeProposal}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-brand-navy"
      >
        <ArrowLeft size={14} />
        Salvar rascunho e ver todas as propostas
      </button>

      <SimulationSummary simulation={simulation} />
      <StepHeader current={step} />

      <section className="rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
        <div className={step === 0 ? "" : "hidden"}>
          <RegistrationSection
            product={simulation.produto}
            rate={simulation.taxa}
            cpf={simulation.cpf}
            name={simulation.nome}
            birthDate={simulation.nascimento}
            email={simulation.email}
            phone={simulation.celular}
            data={data.registration}
            onChange={(value) => setSectionData("registration", value)}
            onValidChange={(valid) => setValidAt(0, valid)}
          />
        </div>
        <div className={step === 1 ? "" : "hidden"}>
          <ActivityIncomeSection
            data={data.activityIncome}
            onChange={(value) => setSectionData("activityIncome", value)}
            onValidChange={(valid) => setValidAt(1, valid)}
          />
        </div>
        <div className={step === 2 ? "" : "hidden"}>
          <AddressSection
            data={data.address}
            onChange={(value) => setSectionData("address", value)}
            onValidChange={(valid) => setValidAt(2, valid)}
          />
        </div>
        <div className={step === 3 ? "" : "hidden"}>
          <PartnerOpinionSection
            data={data.partnerOpinion}
            onChange={(value) => setSectionData("partnerOpinion", value)}
            onValidChange={(valid) => setValidAt(3, valid)}
          />
        </div>
        <div className={step === 4 ? "" : "hidden"}>
          <GuarantorSection
            data={data.guarantor}
            onChange={(value) => setSectionData("guarantor", value)}
            onValidChange={(valid) => setValidAt(4, valid)}
          />
        </div>
        <div className={step === 5 ? "" : "hidden"}>
          <FinancialSection
            data={data.financial}
            onChange={(value) => setSectionData("financial", value)}
            onValidChange={(valid) => setValidAt(5, valid)}
          />
        </div>
        <div className={step === 6 ? "" : "hidden"}>
          <DocumentsSection
            data={data.documents}
            onChange={(value) => setSectionData("documents", value)}
            onValidChange={(valid) => setValidAt(6, valid)}
          />
        </div>

        <div className="mt-5 flex gap-2">
          {step > 0 ? (
            <Button
              variant="outline"
              className="h-11 rounded-2xl px-6"
              onClick={handleBack}
            >
              Voltar
            </Button>
          ) : null}
          <Button
            variant="yellow"
            className="h-11 flex-1 rounded-2xl"
            disabled={!stepValid[step]}
            onClick={handleNext}
          >
            {step === PROPOSAL_STEPS.length - 1
              ? "Concluir proposta"
              : "Avançar"}
          </Button>
        </div>
      </section>
    </div>
  );
}
