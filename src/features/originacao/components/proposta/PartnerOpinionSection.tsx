import { useFormContext } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormYesNo,
} from "@/components/ui/rhf-fields";
import {
  ACTIVITY_TIME_OPTIONS,
  AUREA_REFERRAL_OPTION,
  HOW_KNOWS_CLIENT_OPTIONS,
  HOW_KNOWS_OTHER,
  RELATIONSHIP_TIME_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatCpf } from "@/lib/format/tax-id";

export function PartnerOpinionSection() {
  const { watch } = useFormContext<ProposalFormData>();
  const howKnows = watch("partnerOpinion.howKnows");

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
          required
        />
      ) : null}

      <FormSelect<ProposalFormData>
        name="activityIncome.activityTime"
        label="Tempo na atividade"
        options={ACTIVITY_TIME_OPTIONS}
        required
      />

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
