import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormYesNo,
} from "@/components/ui/rhf-fields";
import {
  AUREA_REFERRAL_OPTION,
  DOUBTS_RATING,
  HOW_KNOWS_CLIENT_OPTIONS,
  HOW_KNOWS_OTHER,
  OVERALL_RATING_OPTIONS,
  RELATIONSHIP_TIME_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatCpf } from "@/lib/format/tax-id";

export function PartnerOpinionSection() {
  const { watch } = useFormContext<ProposalFormData>();
  const howKnows = watch("partnerOpinion.howKnows");
  const overallRating = watch("partnerOpinion.overallRating");

  return (
    <div className="flex flex-col gap-5">
      <FormSelect<ProposalFormData>
        name="partnerOpinion.relationshipTime"
        label="Tempo de relacionamento com o cliente"
        options={RELATIONSHIP_TIME_OPTIONS}
        required
      />

      <FormSelect<ProposalFormData>
        name="partnerOpinion.howKnows"
        label="Como conhece o cliente"
        options={HOW_KNOWS_CLIENT_OPTIONS}
        required
      />
      {howKnows === HOW_KNOWS_OTHER ? (
        <FormInput<ProposalFormData>
          name="partnerOpinion.howKnowsOther"
          label="Descreva"
          placeholder="Como conheceu o cliente"
          required
        />
      ) : null}
      {howKnows === AUREA_REFERRAL_OPTION ? (
        <FormInput<ProposalFormData>
          name="partnerOpinion.referrerCpf"
          label="CPF de quem indicou"
          transform={formatCpf}
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
        />
      ) : null}

      <FormSelect<ProposalFormData>
        name="partnerOpinion.overallRating"
        label="Avaliação geral"
        options={OVERALL_RATING_OPTIONS}
        required
      />
      {overallRating === DOUBTS_RATING ? (
        <Alert variant="warning">
          <AlertTriangle size={18} />
          <AlertTitle className="text-sm">
            Essa proposta vai obrigatoriamente para a mesa de crédito.
          </AlertTitle>
        </Alert>
      ) : null}

      <FormYesNo<ProposalFormData>
        name="partnerOpinion.informalDebtSigns"
        label="Sinais de endividamento informal"
        required
      />

      <FormYesNo<ProposalFormData>
        name="partnerOpinion.financialUrgencySigns"
        label="Sinais de urgência financeira"
        required
      />

      <FormTextarea<ProposalFormData>
        name="partnerOpinion.notes"
        label="Parecer"
        placeholder="Complemento para a mesa de crédito — não substitui os campos acima"
        required
      />
    </div>
  );
}
