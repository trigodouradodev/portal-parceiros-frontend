import { useFieldArray, useFormContext } from "react-hook-form";
import { Wallet } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { FormInput, FormSelect, FormYesNo } from "@/components/ui/rhf-fields";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import {
  ACTIVITY_CATEGORY_OPTIONS,
  ACTIVITY_TIME_OPTIONS,
  BUSINESS_ACTIVITY_BRANCH_OPTIONS,
  BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH,
  INCOME_SOURCE_OPTIONS,
  OTHER_OPTION,
  requiresProfession,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/lib/format/money";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import {
  RemovableCard,
  RepeatableGroup,
} from "@/features/originacao/components/proposta/RepeatableGroup";

export function ActivityIncomeSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const hasMultipleSources = watch("activityIncome.hasMultipleSources");
  const nextAdditionalIncomeId = watch("activityIncome.nextAdditionalIncomeId");
  const activityCategories = watch("registration.activityCategories");
  const professionRequired = requiresProfession(activityCategories);
  const businessActivityBranch = watch("registration.businessActivityBranch");
  const subcategoryOptions =
    BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH[businessActivityBranch] ??
    [];
  const branchLabel = BUSINESS_ACTIVITY_BRANCH_OPTIONS.find(
    (option) => option.value === businessActivityBranch,
  )?.label;
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
      <FormSection title="Atividade profissional">
        <FormField
          control={control}
          name="registration.activityCategories"
          render={({ field, fieldState }) => (
            <SelectDialogField
              name={field.name}
              label="Atividade econômica"
              value={field.value[0] ?? ""}
              onChange={(value) => field.onChange(value ? [value] : [])}
              options={ACTIVITY_CATEGORY_OPTIONS}
              required
              error={fieldState.error?.message}
            />
          )}
        />
        {activityCategories.includes(OTHER_OPTION) ? (
          <FormInput<ProposalFormData>
            name="registration.activityCategoryOther"
            label="Qual?"
            placeholder="Descreva a ocupação"
            required
          />
        ) : null}

        {professionRequired ? (
          <FormInput<ProposalFormData>
            name="registration.occupation"
            label="Profissão"
            placeholder="Informe a profissão"
            required
          />
        ) : null}

        <FormSelect<ProposalFormData>
          name="registration.businessActivityBranch"
          label="Ramo de atividade"
          options={BUSINESS_ACTIVITY_BRANCH_OPTIONS}
          required
        />
        {businessActivityBranch ? (
          <FormSelect<ProposalFormData>
            name="registration.businessActivitySubcategory"
            label={`Subcategoria de ${branchLabel}`}
            options={subcategoryOptions}
            required
          />
        ) : null}

        <FormSelect<ProposalFormData>
          name="activityIncome.activityTime"
          label="Tempo na atividade"
          options={ACTIVITY_TIME_OPTIONS}
          required
        />
      </FormSection>

      <FormInput<ProposalFormData>
        name="activityIncome.monthlyIncome"
        label="Renda mensal declarada"
        hint="Renda da atividade principal informada nesta tela."
        transform={formatMoneyBrl}
        icon={<Wallet size={16} />}
        placeholder="R$ 0,00"
        inputMode="numeric"
        required
      />

      <FormSelect<ProposalFormData>
        name="activityIncome.incomeSource"
        label="Fonte principal da renda declarada"
        hint="Refere-se apenas à renda declarada acima — outras fontes são informadas a seguir."
        options={INCOME_SOURCE_OPTIONS}
        required
      />

      <FormYesNo<ProposalFormData>
        name="activityIncome.hasMultipleSources"
        label="Possui múltiplas fontes de renda?"
        hint="Considere renda além da atividade principal: aluguel, pensão, outro trabalho, etc."
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
    </div>
  );
}
