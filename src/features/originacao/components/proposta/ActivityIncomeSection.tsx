import { useFormContext } from "react-hook-form";
import { Building2, Wallet } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { SelectField, toSelectOptions } from "@/components/ui/select-field";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { YesNoChips } from "@/features/originacao/components/YesNoChips";
import {
  ACTIVITY_TIME_OPTIONS,
  INCOME_PROOF_OPTIONS,
  INCOME_SOURCE_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/lib/format/money";
import { formatCnpj } from "@/lib/format/tax-id";

export function ActivityIncomeSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const hasMultipleSources = watch("activityIncome.hasMultipleSources");

  function handleMultipleSourcesChange(value: boolean) {
    setValue("activityIncome.hasMultipleSources", value, { shouldDirty: true });
    if (!value) {
      setValue("activityIncome.secondaryIncome", "", { shouldDirty: true });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="activityIncome.cnpj"
        render={({ field }) => (
          <InputField
            label="CNPJ (opcional)"
            value={field.value}
            onChange={(value) => field.onChange(formatCnpj(value))}
            icon={<Building2 size={16} />}
            placeholder="00.000.000/0001-00"
            inputMode="numeric"
            maxLength={18}
          />
        )}
      />

      <FormField
        control={control}
        name="activityIncome.activityTime"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#1A1D2E]">
              Tempo na atividade
            </Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TIME_OPTIONS.map((option) => (
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
        name="activityIncome.monthlyIncome"
        render={({ field }) => (
          <InputField
            label="Renda mensal declarada"
            value={field.value}
            onChange={(value) => field.onChange(formatMoneyBrl(value))}
            icon={<Wallet size={16} />}
            placeholder="R$ 0,00"
            inputMode="numeric"
          />
        )}
      />

      <FormField
        control={control}
        name="activityIncome.incomeSource"
        render={({ field }) => (
          <SelectField
            label="Fonte da renda"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(INCOME_SOURCE_OPTIONS)}
          />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Possui múltiplas fontes de renda?
        </Label>
        <YesNoChips
          value={hasMultipleSources}
          onChange={handleMultipleSourcesChange}
        />
      </div>

      {hasMultipleSources ? (
        <FormField
          control={control}
          name="activityIncome.secondaryIncome"
          render={({ field }) => (
            <InputField
              label="Renda secundária"
              value={field.value}
              onChange={(value) => field.onChange(formatMoneyBrl(value))}
              icon={<Wallet size={16} />}
              placeholder="R$ 0,00"
              inputMode="numeric"
            />
          )}
        />
      ) : null}

      <FormField
        control={control}
        name="activityIncome.availableProof"
        render={({ field }) => (
          <SelectField
            label="Comprovante disponível?"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(INCOME_PROOF_OPTIONS)}
          />
        )}
      />
    </div>
  );
}
