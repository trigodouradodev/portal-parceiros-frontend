import { useFieldArray, useFormContext } from "react-hook-form";
import { Wallet } from "lucide-react";
import { FormInput, FormSelect, FormYesNo } from "@/components/ui/rhf-fields";
import {
  INCOME_PROOF_OPTIONS,
  INCOME_SOURCE_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/lib/format/money";
import {
  RemovableCard,
  RepeatableGroup,
} from "@/features/originacao/components/proposta/RepeatableGroup";

export function ActivityIncomeSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const hasMultipleSources = watch("activityIncome.hasMultipleSources");
  const nextAdditionalIncomeId = watch("activityIncome.nextAdditionalIncomeId");
  const {
    fields: additionalIncomes,
    append: appendAdditionalIncome,
    remove: removeAdditionalIncome,
    replace: replaceAdditionalIncomes,
  } = useFieldArray({
    control,
    name: "activityIncome.additionalIncomes",
    keyName: "fieldId",
  });

  function addAdditionalIncome() {
    appendAdditionalIncome({
      id: nextAdditionalIncomeId,
      source: "",
      amount: "",
    });
    setValue(
      "activityIncome.nextAdditionalIncomeId",
      nextAdditionalIncomeId + 1,
      { shouldDirty: true },
    );
  }

  function handleMultipleSourcesChange(value: boolean) {
    if (!value) {
      replaceAdditionalIncomes([]);
      return;
    }
    if (additionalIncomes.length === 0) {
      addAdditionalIncome();
    }
  }

  return (
    <div className="flex flex-col gap-5">
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
        options={INCOME_SOURCE_OPTIONS}
        required
      />

      <FormYesNo<ProposalFormData>
        name="activityIncome.hasMultipleSources"
        label="Possui múltiplas fontes de renda?"
        onChange={handleMultipleSourcesChange}
      />

      {hasMultipleSources ? (
        <RepeatableGroup
          title="Renda adicional"
          addLabel="Adicionar outra renda"
          emptyLabel="Nenhuma renda adicional adicionada."
          isEmpty={additionalIncomes.length === 0}
          onAdd={addAdditionalIncome}
        >
          {additionalIncomes.map((income, index) => (
            <RemovableCard
              key={income.fieldId}
              removeLabel="Remover renda adicional"
              onRemove={() => removeAdditionalIncome(index)}
              header={
                <FormSelect<ProposalFormData>
                  name={`activityIncome.additionalIncomes.${index}.source`}
                  label="Fonte da renda"
                  options={INCOME_SOURCE_OPTIONS}
                  required
                />
              }
            >
              <FormInput<ProposalFormData>
                name={`activityIncome.additionalIncomes.${index}.amount`}
                label="Valor"
                transform={formatMoneyBrl}
                icon={<Wallet size={16} />}
                placeholder="R$ 0,00"
                inputMode="numeric"
                required
              />
            </RemovableCard>
          ))}
        </RepeatableGroup>
      ) : null}

      <FormSelect<ProposalFormData>
        name="activityIncome.availableProof"
        label="Comprovante disponível?"
        options={INCOME_PROOF_OPTIONS}
        required
      />
    </div>
  );
}
