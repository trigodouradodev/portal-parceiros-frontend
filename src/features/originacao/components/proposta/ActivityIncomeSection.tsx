import { useFieldArray, useFormContext } from "react-hook-form";
import { Wallet } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { FormInput, FormSelect } from "@/components/ui/rhf-fields";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import {
  ACTIVITY_CATEGORY_OPTIONS,
  ACTIVITY_TIME_OPTIONS,
  BUSINESS_ACTIVITY_BRANCH_OPTIONS,
  BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH,
  FAMILY_RELATIONSHIP_OPTIONS,
  INCOME_SOURCE_OPTIONS,
  OTHER_OPTION,
  PRIMARY_INCOME_SOURCE_OPTIONS,
  requiresProfession,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { fmtBRL, formatMoneyBrl, parseMoneyBrl } from "@/lib/format/money";
import { FormSection } from "@/features/originacao/components/proposta/FormSection";
import {
  RemovableCard,
  RepeatableGroup,
} from "@/features/originacao/components/proposta/RepeatableGroup";
import { IncomeSource } from "@/services/quotes/quotes.enums";

export function ActivityIncomeSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const nextAdditionalIncomeId = watch("activityIncome.nextAdditionalIncomeId");
  const primaryIncome = watch("activityIncome.monthlyIncome");
  const additionalIncomeValues = watch("activityIncome.additionalIncomes");
  const activityCategories = watch("registration.activityCategories");
  const professionRequired = requiresProfession(activityCategories);
  const businessActivityBranch = watch("registration.businessActivityBranch");
  const subcategoryOptions =
    BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH[businessActivityBranch] ??
    [];
  const branchLabel = BUSINESS_ACTIVITY_BRANCH_OPTIONS.find(
    (option) => option.value === businessActivityBranch,
  )?.label;
  const totalDeclaredIncome =
    parseMoneyBrl(primaryIncome) +
    additionalIncomeValues.reduce(
      (total, income) => total + parseMoneyBrl(income.amount),
      0,
    );
  const {
    fields: additionalIncomes,
    append: appendAdditionalIncome,
    remove: removeAdditionalIncome,
  } = useFieldArray({
    control,
    name: "activityIncome.additionalIncomes",
    keyName: "fieldId",
  });

  function handleBranchChange(nextBranch: string) {
    const nextOptions =
      BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH[nextBranch] ?? [];
    const currentSubcategory = watch(
      "registration.businessActivitySubcategory",
    );
    const stillValid = nextOptions.some(
      (option) => option.value === currentSubcategory,
    );
    if (!stillValid) {
      setValue("registration.businessActivitySubcategory", "", {
        shouldValidate: true,
      });
    }
  }

  function addAdditionalIncome() {
    if (additionalIncomes.length >= 9) return;
    appendAdditionalIncome({
      id: nextAdditionalIncomeId,
      activityCategories: [],
      activityCategoryOther: "",
      occupation: "",
      businessActivityBranch: "",
      businessActivitySubcategory: "",
      activityTime: "",
      source: "",
      amount: "",
      familyRelationship: "",
    });
    setValue(
      "activityIncome.nextAdditionalIncomeId",
      nextAdditionalIncomeId + 1,
      { shouldDirty: true },
    );
  }

  function handleAdditionalBranchChange(index: number, nextBranch: string) {
    const nextOptions =
      BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH[nextBranch] ?? [];
    const currentSubcategory = watch(
      `activityIncome.additionalIncomes.${index}.businessActivitySubcategory`,
    );
    if (!nextOptions.some((option) => option.value === currentSubcategory)) {
      setValue(
        `activityIncome.additionalIncomes.${index}.businessActivitySubcategory`,
        "",
        { shouldValidate: true },
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormSection title="Renda e Atividade">
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
          onValueChange={handleBranchChange}
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
        label="Fonte da renda"
        hint="Refere-se apenas à renda declarada acima — outras fontes são informadas a seguir."
        options={PRIMARY_INCOME_SOURCE_OPTIONS}
        required
      />

      <RepeatableGroup
        title="Outras rendas"
        hint="Adicione somente quando houver outra fonte de renda."
        addLabel="Adicionar outra renda"
        emptyLabel="Nenhuma outra renda adicionada."
        isEmpty={additionalIncomes.length === 0}
        onAdd={addAdditionalIncome}
      >
        {additionalIncomes.map((income, index) => {
          const categories = watch(
            `activityIncome.additionalIncomes.${index}.activityCategories`,
          );
          const branch = watch(
            `activityIncome.additionalIncomes.${index}.businessActivityBranch`,
          );
          const source = watch(
            `activityIncome.additionalIncomes.${index}.source`,
          );
          const secondarySubcategories =
            BUSINESS_ACTIVITY_SUBCATEGORY_OPTIONS_BY_BRANCH[branch] ?? [];
          const secondaryBranchLabel = BUSINESS_ACTIVITY_BRANCH_OPTIONS.find(
            (option) => option.value === branch,
          )?.label;
          return (
            <RemovableCard
              key={income.fieldId}
              removeLabel="Remover outra renda"
              onRemove={() => removeAdditionalIncome(index)}
              header={<strong>Outra renda {index + 1}</strong>}
            >
              <FormField
                control={control}
                name={`activityIncome.additionalIncomes.${index}.activityCategories`}
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
              {categories.includes(OTHER_OPTION) ? (
                <FormInput<ProposalFormData>
                  name={`activityIncome.additionalIncomes.${index}.activityCategoryOther`}
                  label="Qual?"
                  placeholder="Descreva a ocupação"
                  required
                />
              ) : null}
              {requiresProfession(categories) ? (
                <FormInput<ProposalFormData>
                  name={`activityIncome.additionalIncomes.${index}.occupation`}
                  label="Profissão"
                  placeholder="Informe a profissão"
                  required
                />
              ) : null}
              <FormSelect<ProposalFormData>
                name={`activityIncome.additionalIncomes.${index}.businessActivityBranch`}
                label="Ramo de atividade"
                options={BUSINESS_ACTIVITY_BRANCH_OPTIONS}
                onValueChange={(value) =>
                  handleAdditionalBranchChange(index, value)
                }
                required
              />
              {branch ? (
                <FormSelect<ProposalFormData>
                  name={`activityIncome.additionalIncomes.${index}.businessActivitySubcategory`}
                  label={`Subcategoria de ${secondaryBranchLabel}`}
                  options={secondarySubcategories}
                  required
                />
              ) : null}
              <FormSelect<ProposalFormData>
                name={`activityIncome.additionalIncomes.${index}.activityTime`}
                label="Tempo na atividade"
                options={ACTIVITY_TIME_OPTIONS}
                required
              />
              <FormInput<ProposalFormData>
                name={`activityIncome.additionalIncomes.${index}.amount`}
                label="Renda mensal declarada"
                transform={formatMoneyBrl}
                icon={<Wallet size={16} />}
                placeholder="R$ 0,00"
                inputMode="numeric"
                required
              />
              <FormSelect<ProposalFormData>
                name={`activityIncome.additionalIncomes.${index}.source`}
                label="Fonte da renda"
                options={INCOME_SOURCE_OPTIONS}
                required
              />
              {source === IncomeSource.FAMILY_INCOME ? (
                <FormSelect<ProposalFormData>
                  name={`activityIncome.additionalIncomes.${index}.familyRelationship`}
                  label="Grau de parentesco"
                  options={FAMILY_RELATIONSHIP_OPTIONS}
                  required
                />
              ) : null}
            </RemovableCard>
          );
        })}
      </RepeatableGroup>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Renda total declarada
          </p>
          <p className="text-xs text-muted-foreground">
            Soma de todas as rendas, incluindo renda familiar.
          </p>
        </div>
        <strong className="whitespace-nowrap text-base text-foreground">
          {fmtBRL(totalDeclaredIncome)}
        </strong>
      </div>
    </div>
  );
}
