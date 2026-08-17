import { useFieldArray, useFormContext } from "react-hook-form";
import { AlertTriangle, Plus, Trash2, Wallet } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-medium text-[#1A1D2E]">
            Despesas pessoais
          </Label>
          <button
            type="button"
            onClick={addExpense}
            className="flex items-center gap-1 text-sm font-semibold text-brand-navy"
          >
            <Plus size={14} />
            Adicionar despesa
          </button>
        </div>
        {expenses.length === 0 ? (
          <p className="mb-1 text-xs text-[#9DA3B4]">
            Nenhuma despesa adicionada.
          </p>
        ) : null}
        <div className="flex flex-col gap-3">
          {expenses.map((expense, index) => (
            <div
              key={expense.fieldId}
              className="flex flex-col gap-3 rounded-2xl bg-[#F5F6FA] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <FormField
                    control={control}
                    name={`financial.expenses.${index}.category`}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExpense(index)}
                  className="shrink-0 p-2 text-[#D84040]"
                  aria-label="Remover despesa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={control}
                  name={`financial.expenses.${index}.amount`}
                  render={({ field }) => (
                    <InputField
                      label="Valor"
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(formatMoneyBrl(value))
                      }
                      icon={<Wallet size={14} />}
                      placeholder="R$ 0,00"
                      inputMode="numeric"
                    />
                  )}
                />
                <FormField
                  control={control}
                  name={`financial.expenses.${index}.description`}
                  render={({ field }) => (
                    <InputField
                      label="Descrição"
                      value={field.value}
                      onChange={field.onChange}
                      icon={<Wallet size={14} />}
                      placeholder="Opcional"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E4EC] pt-2">
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-medium text-[#1A1D2E]">
            Empréstimos
          </Label>
          <button
            type="button"
            onClick={addLoan}
            className="flex items-center gap-1 text-sm font-semibold text-brand-navy"
          >
            <Plus size={14} />
            Adicionar empréstimo
          </button>
        </div>
        {loans.length === 0 ? (
          <p className="mb-1 text-xs text-[#9DA3B4]">
            Nenhum empréstimo adicionado.
          </p>
        ) : null}
        <div className="flex flex-col gap-3">
          {loans.map((loan, index) => (
            <div
              key={loan.fieldId}
              className="flex flex-col gap-3 rounded-2xl bg-[#F5F6FA] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <FormField
                    control={control}
                    name={`financial.loans.${index}.institution`}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Instituição/Credor" />
                        </SelectTrigger>
                        <SelectContent>
                          {CREDITOR_INSTITUTION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLoan(index)}
                  className="shrink-0 p-2 text-[#D84040]"
                  aria-label="Remover empréstimo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={control}
                  name={`financial.loans.${index}.installmentAmount`}
                  render={({ field }) => (
                    <InputField
                      label="Valor da parcela"
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(formatMoneyBrl(value))
                      }
                      icon={<Wallet size={14} />}
                      placeholder="R$ 0,00"
                      inputMode="numeric"
                    />
                  )}
                />
                <FormField
                  control={control}
                  name={`financial.loans.${index}.frequency`}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-[#1A1D2E]">
                        Frequência
                      </Label>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_FREQUENCY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={control}
                  name={`financial.loans.${index}.category`}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-[#1A1D2E]">
                        Categoria
                      </Label>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                <FormField
                  control={control}
                  name={`financial.loans.${index}.description`}
                  render={({ field }) => (
                    <InputField
                      label="Descrição"
                      value={field.value}
                      onChange={field.onChange}
                      icon={<Wallet size={14} />}
                      placeholder="Opcional"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>

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
