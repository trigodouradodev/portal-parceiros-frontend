import { useFormContext } from "react-hook-form";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { YesNoChips } from "@/features/originacao/components/YesNoChips";
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
  const overallRating = watch("partnerOpinion.overallRating");

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="partnerOpinion.relationshipTime"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Tempo de relacionamento com o cliente
            </Label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_TIME_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={field.value === option}
                  onClick={() => field.onChange(option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
          </div>
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.howKnows"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Como conhece o cliente
            </Label>
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {HOW_KNOWS_CLIENT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Avaliação geral
            </Label>
            <div className="flex flex-wrap gap-2">
              {OVERALL_RATING_OPTIONS.map((option) => (
                <ChipButton
                  key={option}
                  active={field.value === option}
                  onClick={() => field.onChange(option)}
                >
                  {option}
                </ChipButton>
              ))}
            </div>
            {overallRating === DOUBTS_RATING ? (
              <Alert variant="warning" className="mt-1">
                <AlertTriangle size={18} />
                <AlertTitle className="text-sm">
                  Essa proposta vai obrigatoriamente para a mesa de crédito.
                </AlertTitle>
              </Alert>
            ) : null}
          </div>
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.informalDebtSigns"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Sinais de endividamento informal
            </Label>
            <YesNoChips value={field.value} onChange={field.onChange} />
          </div>
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.financialUrgencySigns"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Sinais de urgência financeira
            </Label>
            <YesNoChips value={field.value} onChange={field.onChange} />
          </div>
        )}
      />

      <FormField
        control={control}
        name="partnerOpinion.notes"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Parecer
            </Label>
            <Textarea
              value={field.value}
              onChange={field.onChange}
              placeholder="Complemento para a mesa de crédito — não substitui os campos acima"
              className="rounded-2xl"
            />
          </div>
        )}
      />
    </div>
  );
}
