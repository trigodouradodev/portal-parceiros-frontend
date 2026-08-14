import { useEffect } from "react";
import { Building2, Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
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
  ACTIVITY_TIME_OPTIONS,
  INCOME_PROOF_OPTIONS,
  INCOME_SOURCE_OPTIONS,
  isActivityIncomeValid,
  type ActivityIncomeData,
} from "@/features/originacao/data/proposal";
import { formatCnpj } from "@/features/originacao/utils/format-cnpj";
import { formatMoneyBrl } from "@/features/originacao/utils/format-money-brl";

interface ActivityIncomeSectionProps {
  data: ActivityIncomeData;
  onChange: (data: ActivityIncomeData) => void;
  onValidChange: (valid: boolean) => void;
}

export function ActivityIncomeSection({
  data,
  onChange,
  onValidChange,
}: ActivityIncomeSectionProps) {
  function set<K extends keyof ActivityIncomeData>(
    key: K,
    value: ActivityIncomeData[K],
  ) {
    onChange({ ...data, [key]: value });
  }

  useEffect(() => {
    onValidChange(isActivityIncomeValid(data));
  }, [data, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <OriginacaoFieldInput
        label="CNPJ (opcional)"
        value={data.cnpj}
        onChange={(value) => set("cnpj", formatCnpj(value))}
        icon={<Building2 size={16} />}
        placeholder="00.000.000/0001-00"
        inputMode="numeric"
        maxLength={18}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Tempo na atividade
        </Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TIME_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={data.activityTime === option}
              onClick={() => set("activityTime", option)}
            >
              {option}
            </ChipButton>
          ))}
        </div>
      </div>

      <OriginacaoFieldInput
        label="Renda mensal declarada"
        value={data.monthlyIncome}
        onChange={(value) => set("monthlyIncome", formatMoneyBrl(value))}
        icon={<Wallet size={16} />}
        placeholder="R$ 0,00"
        inputMode="numeric"
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Fonte da renda
        </Label>
        <Select
          value={data.incomeSource || undefined}
          onValueChange={(value) => set("incomeSource", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {INCOME_SOURCE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Possui múltiplas fontes de renda?
        </Label>
        <YesNoChips
          value={data.hasMultipleSources}
          onChange={(value) => {
            if (!value) {
              onChange({
                ...data,
                hasMultipleSources: false,
                secondaryIncome: "",
              });
              return;
            }
            set("hasMultipleSources", true);
          }}
        />
      </div>

      {data.hasMultipleSources ? (
        <OriginacaoFieldInput
          label="Renda secundária"
          value={data.secondaryIncome}
          onChange={(value) => set("secondaryIncome", formatMoneyBrl(value))}
          icon={<Wallet size={16} />}
          placeholder="R$ 0,00"
          inputMode="numeric"
        />
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Comprovante disponível?
        </Label>
        <Select
          value={data.availableProof || undefined}
          onValueChange={(value) => set("availableProof", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {INCOME_PROOF_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
