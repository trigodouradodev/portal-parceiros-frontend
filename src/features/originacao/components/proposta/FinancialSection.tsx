import { useEffect } from "react";
import { AlertTriangle, Plus, Trash2, Wallet } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OriginacaoFieldInput } from "@/features/originacao/components/OriginacaoFieldInput";
import {
  AGIOTA_CREDITOR,
  CREDITOR_INSTITUTION_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  LOAN_CATEGORY_OPTIONS,
  LOAN_FREQUENCY_OPTIONS,
  isFinancialValid,
  type ExpenseItem,
  type FinancialData,
  type LoanItem,
} from "@/features/originacao/data/proposal";
import { formatMoneyBrl } from "@/features/originacao/utils/format-money-brl";

interface FinancialSectionProps {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
  onValidChange: (valid: boolean) => void;
}

export function FinancialSection({
  data,
  onChange,
  onValidChange,
}: FinancialSectionProps) {
  useEffect(() => {
    onValidChange(isFinancialValid());
  }, [onValidChange]);

  function addExpense() {
    onChange({
      ...data,
      expenses: [
        ...data.expenses,
        { id: data.nextId, category: "", amount: "", description: "" },
      ],
      nextId: data.nextId + 1,
    });
  }

  function updateExpense(id: number, patch: Partial<ExpenseItem>) {
    onChange({
      ...data,
      expenses: data.expenses.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeExpense(id: number) {
    onChange({
      ...data,
      expenses: data.expenses.filter((item) => item.id !== id),
    });
  }

  function addLoan() {
    onChange({
      ...data,
      loans: [
        ...data.loans,
        {
          id: data.nextId,
          installmentAmount: "",
          frequency: "",
          institution: "",
          category: "",
          description: "",
        },
      ],
      nextId: data.nextId + 1,
    });
  }

  function updateLoan(id: number, patch: Partial<LoanItem>) {
    onChange({
      ...data,
      loans: data.loans.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeLoan(id: number) {
    onChange({
      ...data,
      loans: data.loans.filter((item) => item.id !== id),
    });
  }

  const hasAgiota = data.loans.some(
    (loan) => loan.institution === AGIOTA_CREDITOR,
  );

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
        {data.expenses.length === 0 ? (
          <p className="mb-1 text-xs text-[#9DA3B4]">
            Nenhuma despesa adicionada.
          </p>
        ) : null}
        <div className="flex flex-col gap-3">
          {data.expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex flex-col gap-3 rounded-2xl bg-[#F5F6FA] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={expense.category || undefined}
                    onValueChange={(value) =>
                      updateExpense(expense.id, { category: value })
                    }
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
                </div>
                <button
                  type="button"
                  onClick={() => removeExpense(expense.id)}
                  className="shrink-0 p-2 text-[#D84040]"
                  aria-label="Remover despesa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <OriginacaoFieldInput
                  label="Valor"
                  value={expense.amount}
                  onChange={(value) =>
                    updateExpense(expense.id, {
                      amount: formatMoneyBrl(value),
                    })
                  }
                  icon={<Wallet size={14} />}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                />
                <OriginacaoFieldInput
                  label="Descrição"
                  value={expense.description}
                  onChange={(value) =>
                    updateExpense(expense.id, { description: value })
                  }
                  icon={<Wallet size={14} />}
                  placeholder="Opcional"
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
        {data.loans.length === 0 ? (
          <p className="mb-1 text-xs text-[#9DA3B4]">
            Nenhum empréstimo adicionado.
          </p>
        ) : null}
        <div className="flex flex-col gap-3">
          {data.loans.map((loan) => (
            <div
              key={loan.id}
              className="flex flex-col gap-3 rounded-2xl bg-[#F5F6FA] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={loan.institution || undefined}
                    onValueChange={(value) =>
                      updateLoan(loan.id, { institution: value })
                    }
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
                </div>
                <button
                  type="button"
                  onClick={() => removeLoan(loan.id)}
                  className="shrink-0 p-2 text-[#D84040]"
                  aria-label="Remover empréstimo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <OriginacaoFieldInput
                  label="Valor da parcela"
                  value={loan.installmentAmount}
                  onChange={(value) =>
                    updateLoan(loan.id, {
                      installmentAmount: formatMoneyBrl(value),
                    })
                  }
                  icon={<Wallet size={14} />}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                />
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-[#1A1D2E]">
                    Frequência
                  </Label>
                  <Select
                    value={loan.frequency || undefined}
                    onValueChange={(value) =>
                      updateLoan(loan.id, { frequency: value })
                    }
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
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-[#1A1D2E]">
                    Categoria
                  </Label>
                  <Select
                    value={loan.category || undefined}
                    onValueChange={(value) =>
                      updateLoan(loan.id, { category: value })
                    }
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
                <OriginacaoFieldInput
                  label="Descrição"
                  value={loan.description}
                  onChange={(value) =>
                    updateLoan(loan.id, { description: value })
                  }
                  icon={<Wallet size={14} />}
                  placeholder="Opcional"
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
