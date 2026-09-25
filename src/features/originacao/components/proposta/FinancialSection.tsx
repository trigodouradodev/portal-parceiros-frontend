import { useMemo, type HTMLAttributes } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AlertTriangle, Wallet } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormInput, FormSelect } from "@/components/ui/rhf-fields";
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
  PAYMENT_PIX_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { formatPartyTelephone } from "@/features/originacao/mappers/map-party-to-guarantor";
import { formatMoneyBrl } from "@/lib/format/money";
import { formatCpf } from "@/lib/format/tax-id";
import { PaymentPixType } from "@/services/quotes/quotes.enums";

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

const PIX_PLACEHOLDERS: Record<string, string> = {
  [PaymentPixType.CPF]: "000.000.000-00",
  [PaymentPixType.TELEPHONE]: "(11) 98888-7777",
  [PaymentPixType.EMAIL]: "um@email.com",
  [PaymentPixType.RANDOM_KEY]: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
};

function formatPixInput(type: string, value: string): string {
  if (type === PaymentPixType.CPF) return formatCpf(value);
  if (type === PaymentPixType.TELEPHONE) return formatPartyTelephone(value);
  return value;
}

function pixCodeInputMode(
  type: string,
): HTMLAttributes<HTMLInputElement>["inputMode"] {
  if (type === PaymentPixType.CPF || type === PaymentPixType.TELEPHONE) {
    return "numeric";
  }
  if (type === PaymentPixType.EMAIL) return "email";
  return "text";
}

function pixCodeMaxLength(type: string): number | undefined {
  if (type === PaymentPixType.CPF) return 14;
  if (type === PaymentPixType.TELEPHONE) return 15;
  if (type === PaymentPixType.RANDOM_KEY) return 36;
  return undefined;
}

function pixCodeFieldProps(type: string) {
  return {
    placeholder: PIX_PLACEHOLDERS[type] ?? "Chave PIX",
    transform: (value: string) => formatPixInput(type, value),
    type: type === PaymentPixType.EMAIL ? "email" : "text",
    inputMode: pixCodeInputMode(type),
    maxLength: pixCodeMaxLength(type),
  };
}

export function FinancialSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const nextId = watch("financial.nextId");
  const paymentPixType = watch("financial.paymentPixType");
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
  const pixCodeProps = useMemo(
    () => pixCodeFieldProps(paymentPixType),
    [paymentPixType],
  );

  function addExpense() {
    appendExpense({ id: nextId, ...EMPTY_EXPENSE });
    setValue("financial.nextId", nextId + 1, { shouldDirty: true });
  }

  function addLoan() {
    appendLoan({ id: nextId, ...EMPTY_LOAN });
    setValue("financial.nextId", nextId + 1, { shouldDirty: true });
  }

  function handlePixTypeChange(value: string) {
    if (value === paymentPixType) return;
    setValue("financial.paymentPixCode", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        <FormSelect<ProposalFormData>
          name="financial.paymentPixType"
          label="Tipo de chave Pix"
          placeholder="Selecione o tipo"
          options={PAYMENT_PIX_OPTIONS}
          required
          onValueChange={handlePixTypeChange}
        />
        <FormInput<ProposalFormData>
          name="financial.paymentPixCode"
          label="Chave Pix"
          required
          {...pixCodeProps}
        />
      </div>

      <RepeatableGroup
        title="Despesas pessoais"
        hint="Despesas fixas mensais relevantes para avaliar a capacidade de pagamento."
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
                label="Categoria"
                options={EXPENSE_CATEGORY_OPTIONS}
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
          hint="Empréstimos e financiamentos formais em aberto — diferente dos sinais de endividamento informal do Parecer do Parceiro."
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
                  label="Instituição/Credor"
                  options={CREDITOR_INSTITUTION_OPTIONS}
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
                  options={LOAN_FREQUENCY_OPTIONS}
                />
              </div>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <FormSelect<ProposalFormData>
                  name={`financial.loans.${index}.category`}
                  label="Categoria"
                  options={LOAN_CATEGORY_OPTIONS}
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
