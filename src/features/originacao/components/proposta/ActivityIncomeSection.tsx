import { useFormContext } from "react-hook-form";
import { Building2, Wallet } from "lucide-react";
import { FormInput, FormSelect, FormYesNo } from "@/components/ui/rhf-fields";
import { toSelectOptions } from "@/components/ui/select-option";
import {
  ACTIVITY_TIME_OPTIONS,
  INCOME_PROOF_OPTIONS,
  INCOME_SOURCE_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/lib/format/money";
import { formatCnpj } from "@/lib/format/tax-id";

export function ActivityIncomeSection() {
  const { setValue, watch } = useFormContext<ProposalFormData>();
  const hasMultipleSources = watch("activityIncome.hasMultipleSources");

  function handleMultipleSourcesChange(value: boolean) {
    if (!value) {
      setValue("activityIncome.secondaryIncome", "", { shouldDirty: true });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormInput<ProposalFormData>
        name="activityIncome.cnpj"
        label="CNPJ (opcional)"
        transform={formatCnpj}
        icon={<Building2 size={16} />}
        placeholder="00.000.000/0001-00"
        inputMode="numeric"
        maxLength={18}
      />

      <FormSelect<ProposalFormData>
        name="activityIncome.activityTime"
        label="Tempo na atividade"
        options={toSelectOptions(ACTIVITY_TIME_OPTIONS)}
        required
      />

      <FormInput<ProposalFormData>
        name="activityIncome.monthlyIncome"
        label="Renda mensal declarada"
        transform={formatMoneyBrl}
        icon={<Wallet size={16} />}
        placeholder="R$ 0,00"
        inputMode="numeric"
        required
      />

      <FormSelect<ProposalFormData>
        name="activityIncome.incomeSource"
        label="Fonte da renda"
        options={toSelectOptions(INCOME_SOURCE_OPTIONS)}
        required
      />

      <FormYesNo<ProposalFormData>
        name="activityIncome.hasMultipleSources"
        label="Possui múltiplas fontes de renda?"
        onChange={handleMultipleSourcesChange}
      />

      {hasMultipleSources ? (
        <FormInput<ProposalFormData>
          name="activityIncome.secondaryIncome"
          label="Renda secundária"
          transform={formatMoneyBrl}
          icon={<Wallet size={16} />}
          placeholder="R$ 0,00"
          inputMode="numeric"
          required
        />
      ) : null}

      <FormSelect<ProposalFormData>
        name="activityIncome.availableProof"
        label="Comprovante disponível?"
        options={toSelectOptions(INCOME_PROOF_OPTIONS)}
        required
      />
    </div>
  );
}
