import { useEffect } from "react";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import { YesNoChips } from "@/features/originacao/components/YesNoChips";
import {
  AUREA_REFERRAL_OPTION,
  DOUBTS_RATING,
  HOW_KNOWS_CLIENT_OPTIONS,
  HOW_KNOWS_OTHER,
  OVERALL_RATING_OPTIONS,
  RELATIONSHIP_TIME_OPTIONS,
  isPartnerOpinionValid,
  type PartnerOpinionData,
} from "@/features/originacao/data/proposal";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import { cpfFieldError } from "@/features/originacao/utils/is-valid-cpf";

interface PartnerOpinionSectionProps {
  data: PartnerOpinionData;
  onChange: (data: PartnerOpinionData) => void;
  onValidChange: (valid: boolean) => void;
}

export function PartnerOpinionSection({
  data,
  onChange,
  onValidChange,
}: PartnerOpinionSectionProps) {
  function set<K extends keyof PartnerOpinionData>(
    key: K,
    value: PartnerOpinionData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  useEffect(() => {
    onValidChange(isPartnerOpinionValid(data));
  }, [data, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Tempo de relacionamento com o cliente
        </Label>
        <div className="flex flex-wrap gap-2">
          {RELATIONSHIP_TIME_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={data.relationshipTime === option}
              onClick={() => set("relationshipTime", option)}
            >
              {option}
            </ChipButton>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Como conhece o cliente
        </Label>
        <Select
          value={data.howKnows || undefined}
          onValueChange={(value) => set("howKnows", value)}
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
        {data.howKnows === HOW_KNOWS_OTHER ? (
          <OriginacaoFieldInput
            label="Descreva"
            value={data.howKnowsOther}
            onChange={(value) => set("howKnowsOther", value)}
            icon={<CreditCard size={16} />}
            placeholder="Como conheceu o cliente"
          />
        ) : null}
        {data.howKnows === AUREA_REFERRAL_OPTION ? (
          <OriginacaoFieldInput
            label="CPF de quem indicou"
            value={formatCpf(data.referrerCpf)}
            onChange={(value) => set("referrerCpf", formatCpf(value))}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            error={cpfFieldError(data.referrerCpf)}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Avaliação geral
        </Label>
        <div className="flex flex-wrap gap-2">
          {OVERALL_RATING_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={data.overallRating === option}
              onClick={() => set("overallRating", option)}
            >
              {option}
            </ChipButton>
          ))}
        </div>
        {data.overallRating === DOUBTS_RATING ? (
          <Alert variant="warning" className="mt-1">
            <AlertTriangle size={18} />
            <AlertTitle className="text-sm">
              Essa proposta vai obrigatoriamente para a mesa de crédito.
            </AlertTitle>
          </Alert>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Sinais de endividamento informal
        </Label>
        <YesNoChips
          value={data.informalDebtSigns}
          onChange={(value) => set("informalDebtSigns", value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Sinais de urgência financeira
        </Label>
        <YesNoChips
          value={data.financialUrgencySigns}
          onChange={(value) => set("financialUrgencySigns", value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">Parecer</Label>
        <Textarea
          value={data.notes}
          onChange={(event) => set("notes", event.target.value)}
          placeholder="Complemento para a mesa de crédito — não substitui os campos acima"
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
