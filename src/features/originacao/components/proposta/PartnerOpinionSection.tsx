import { useFormContext } from "react-hook-form";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { toSelectOptions } from "@/components/ui/select-option";
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
        render={({ field, fieldState }) => (
          <SelectDialogField
            name={field.name}
            label="Tempo de relacionamento com o cliente"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(RELATIONSHIP_TIME_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.howKnows"
        render={({ field, fieldState }) => (
          <SelectDialogField
            name={field.name}
            label="Como conhece o cliente"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(HOW_KNOWS_CLIENT_OPTIONS)}
            required
            error={fieldState.error?.message}
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
          render={({ field, fieldState }) => (
            <InputField
              name={field.name}
              label="CPF de quem indicou"
              value={formatCpf(field.value)}
              onChange={(value) => field.onChange(formatCpf(value))}
              icon={<CreditCard size={16} />}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              error={fieldState.error?.message ?? cpfFieldError(field.value)}
            />
          )}
        />
      ) : null}

      <FormField
        control={control}
        name="partnerOpinion.overallRating"
        render={({ field, fieldState }) => (
          <>
            <SelectDialogField
              name={field.name}
              label="Avaliação geral"
              value={field.value}
              onChange={field.onChange}
              options={toSelectOptions(OVERALL_RATING_OPTIONS)}
              required
              error={fieldState.error?.message}
            />
            {field.value === DOUBTS_RATING ? (
              <Alert variant="warning">
                <AlertTriangle size={18} />
                <AlertTitle className="text-sm">
                  Essa proposta vai obrigatoriamente para a mesa de crédito.
                </AlertTitle>
              </Alert>
            ) : null}
          </>
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.informalDebtSigns"
        render={({ field, fieldState }) => (
          <YesNoField
            name={field.name}
            label="Sinais de endividamento informal"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.financialUrgencySigns"
        render={({ field, fieldState }) => (
          <YesNoField
            name={field.name}
            label="Sinais de urgência financeira"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.notes"
        render={({ field, fieldState }) => (
          <TextareaField
            name={field.name}
            label="Parecer"
            value={field.value}
            onChange={field.onChange}
            placeholder="Complemento para a mesa de crédito — não substitui os campos acima"
            required
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}
