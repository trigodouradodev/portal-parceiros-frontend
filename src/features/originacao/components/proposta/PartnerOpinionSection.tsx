import { useFormContext } from "react-hook-form";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ChipField } from "@/components/ui/chip-field";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { SelectField, toSelectOptions } from "@/components/ui/select-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { YesNoField } from "@/components/ui/yes-no-field";
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
import { cpfFieldError } from "@/lib/validation/cpf";

export function PartnerOpinionSection() {
  const { control, watch } = useFormContext<ProposalFormData>();
  const howKnows = watch("partnerOpinion.howKnows");

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="partnerOpinion.relationshipTime"
        render={({ field }) => (
          <ChipField
            label="Tempo de relacionamento com o cliente"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(RELATIONSHIP_TIME_OPTIONS)}
          />
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.howKnows"
        render={({ field }) => (
          <SelectField
            label="Como conhece o cliente"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(HOW_KNOWS_CLIENT_OPTIONS)}
          />
        )}
      />
      {howKnows === HOW_KNOWS_OTHER ? (
        <FormField
          control={control}
          name="partnerOpinion.howKnowsOther"
          render={({ field }) => (
            <InputField
              label="Descreva"
              value={field.value}
              onChange={field.onChange}
              icon={<CreditCard size={16} />}
              placeholder="Como conheceu o cliente"
            />
          )}
        />
      ) : null}
      {howKnows === AUREA_REFERRAL_OPTION ? (
        <FormField
          control={control}
          name="partnerOpinion.referrerCpf"
          render={({ field }) => (
            <InputField
              label="CPF de quem indicou"
              value={formatCpf(field.value)}
              onChange={(value) => field.onChange(formatCpf(value))}
              icon={<CreditCard size={16} />}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              error={cpfFieldError(field.value)}
            />
          )}
        />
      ) : null}

      <FormField
        control={control}
        name="partnerOpinion.overallRating"
        render={({ field }) => (
          <ChipField
            label="Avaliação geral"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(OVERALL_RATING_OPTIONS)}
          >
            {field.value === DOUBTS_RATING ? (
              <Alert variant="warning" className="mt-1">
                <AlertTriangle size={18} />
                <AlertTitle className="text-sm">
                  Essa proposta vai obrigatoriamente para a mesa de crédito.
                </AlertTitle>
              </Alert>
            ) : null}
          </ChipField>
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.informalDebtSigns"
        render={({ field }) => (
          <YesNoField
            label="Sinais de endividamento informal"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.financialUrgencySigns"
        render={({ field }) => (
          <YesNoField
            label="Sinais de urgência financeira"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.notes"
        render={({ field }) => (
          <TextareaField
            label="Parecer"
            value={field.value}
            onChange={field.onChange}
            placeholder="Complemento para a mesa de crédito — não substitui os campos acima"
          />
        )}
      />
    </div>
  );
}
