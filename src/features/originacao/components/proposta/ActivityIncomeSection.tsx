import { useFormContext } from "react-hook-form";
import { Building2, Wallet } from "lucide-react";
import { ChipField } from "@/components/ui/chip-field";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { toSelectOptions } from "@/components/ui/select-option";
import { YesNoField } from "@/components/ui/yes-no-field";
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
        render={({ field, fieldState }) => (
          <ChipField
            name={field.name}
            label="Tempo na atividade"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(ACTIVITY_TIME_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="activityIncome.monthlyIncome"
        render={({ field, fieldState }) => (
          <InputField
            name={field.name}
            label="Renda mensal declarada"
            value={field.value}
            onChange={(value) => field.onChange(formatMoneyBrl(value))}
            icon={<Wallet size={16} />}
            placeholder="R$ 0,00"
            inputMode="numeric"
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="activityIncome.incomeSource"
        render={({ field, fieldState }) => (
          <SelectDialogField
            name={field.name}
            label="Fonte da renda"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(INCOME_SOURCE_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <YesNoField
        label="Possui múltiplas fontes de renda?"
        value={hasMultipleSources}
        onChange={handleMultipleSourcesChange}
      />

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
        render={({ field, fieldState }) => (
          <SelectDialogField
            name={field.name}
            label="Comprovante disponível?"
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(INCOME_PROOF_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}
