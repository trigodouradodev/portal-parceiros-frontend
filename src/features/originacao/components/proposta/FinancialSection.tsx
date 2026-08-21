import { useFieldArray, useFormContext } from "react-hook-form";
import { AlertTriangle, Wallet } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormInput, FormSelect } from "@/components/ui/rhf-fields";
import { toSelectOptions } from "@/components/ui/select-option";
import {
  RepeatableGroup,
  RemovableCard,
} from "@/features/originacao/components/proposta/RepeatableGroup";
import {
  AGIOTA_CREDITOR,
  CREDITOR_INSTITUTION_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  LOAN_CATEGORY_OPTIONS,
  LOAN_FREQUENCY_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/lib/format/money";

const EMPTY_EXPENSE = {
  category: "",
  amount: "",
  description: "",
};

const EMPTY_LOAN = {
  installmentAmount: "",
  frequency: "",
  institution: "",
  category: "",
  description: "",
};

export function FinancialSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const nextId = watch("financial.nextId");
  const {
    fields: expenses,
    append: appendExpense,
    remove: removeExpense,
  } = useFieldArray({
    control,
    name: "financial.expenses",
    keyName: "fieldId",
  });
  const {
    fields: loans,
    append: appendLoan,
    remove: removeLoan,
  } = useFieldArray({
    control,
    name: "financial.loans",
    keyName: "fieldId",
  });

  const hasAgiota = loans.some((loan) => loan.institution === AGIOTA_CREDITOR);

  function addExpense() {
    appendExpense({ id: nextId, ...EMPTY_EXPENSE });
    setValue("financial.nextId", nextId + 1, { shouldDirty: true });
  }

  function addLoan() {
    appendLoan({ id: nextId, ...EMPTY_LOAN });
    setValue("financial.nextId", nextId + 1, { shouldDirty: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <RepeatableGroup
        title="Despesas pessoais"
        addLabel="Adicionar despesa"
        emptyLabel="Nenhuma despesa adicionada."
        isEmpty={expenses.length === 0}
        onAdd={addExpense}
      >
        {expenses.map((expense, index) => (
          <RemovableCard
            key={expense.fieldId}
            removeLabel="Remover despesa"
            onRemove={() => removeExpense(index)}
            header={
              <FormSelect<ProposalFormData>
                name={`financial.expenses.${index}.category`}
                placeholder="Categoria"
                options={toSelectOptions(EXPENSE_CATEGORY_OPTIONS)}
              />
            }
          >
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <FormInput<ProposalFormData>
                name={`financial.expenses.${index}.amount`}
                label="Valor"
                transform={formatMoneyBrl}
                icon={<Wallet size={14} />}
                placeholder="R$ 0,00"
                inputMode="numeric"
              />
              <FormInput<ProposalFormData>
                name={`financial.expenses.${index}.description`}
                label="Descrição"
                placeholder="Opcional"
              />
            </div>
          </RemovableCard>
        ))}
      </RepeatableGroup>

      <div className="border-t border-border pt-2">
        <RepeatableGroup
          title="Empréstimos"
          addLabel="Adicionar empréstimo"
          emptyLabel="Nenhum empréstimo adicionado."
          isEmpty={loans.length === 0}
          onAdd={addLoan}
        >
          {loans.map((loan, index) => (
            <RemovableCard
              key={loan.fieldId}
              removeLabel="Remover empréstimo"
              onRemove={() => removeLoan(index)}
              header={
                <FormSelect<ProposalFormData>
                  name={`financial.loans.${index}.institution`}
                  placeholder="Instituição/Credor"
                  options={toSelectOptions(CREDITOR_INSTITUTION_OPTIONS)}
                />
              }
            >
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <FormInput<ProposalFormData>
                  name={`financial.loans.${index}.installmentAmount`}
                  label="Valor da parcela"
                  transform={formatMoneyBrl}
                  icon={<Wallet size={14} />}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                />
                <FormSelect<ProposalFormData>
                  name={`financial.loans.${index}.frequency`}
                  label="Frequência"
                  options={toSelectOptions(LOAN_FREQUENCY_OPTIONS)}
                />
              </div>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <FormSelect<ProposalFormData>
                  name={`financial.loans.${index}.category`}
                  label="Categoria"
                  options={toSelectOptions(LOAN_CATEGORY_OPTIONS)}
                />
                <FormInput<ProposalFormData>
                  name={`financial.loans.${index}.description`}
                  label="Descrição"
                  placeholder="Opcional"
                />
              </div>
            </RemovableCard>
          ))}
        </RepeatableGroup>

        {hasAgiota ? (
          <Alert variant="warning" className="mt-3">
            <AlertTriangle size={18} />
            <AlertTitle className="text-sm">
              Dado confidencial — tratado com sigilo pela análise de crédito.
            </AlertTitle>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
