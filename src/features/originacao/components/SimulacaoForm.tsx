import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  Mail,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "@/components/ui/calendar-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { SelectField, toSelectOptions } from "@/components/ui/select-field";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import {
  AMOUNT_DEFAULT,
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  FIRST_INSTALLMENT_MAX_DAYS,
  INSTALLMENT_OPTIONS,
  isAllowedDueDate,
  PRODUCT_RATE,
  PRODUCTS,
  type SimulationProduct,
} from "@/features/originacao/data/simulacao";
import {
  simulationSchema,
  type SimulationFormValues,
} from "@/features/originacao/schemas/simulation-form";
import type {
  DadosElegibilidade,
  SimulacaoSnapshot,
} from "@/features/originacao/types";
import { formatPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { calcInstallment, fmtBRL } from "@/lib/utils";

interface SimulacaoFormProps {
  prefill: DadosElegibilidade | null;
  hasList: boolean;
  onViewList: () => void;
  onCompleted: (snapshot: SimulacaoSnapshot) => void;
}

export function SimulacaoForm({
  prefill,
  hasList,
  onViewList,
  onCompleted,
}: SimulacaoFormProps) {
  const [changingProduct, setChangingProduct] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState<Date | undefined>(undefined);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [showRate, setShowRate] = useState(false);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    mode: "onChange",
    defaultValues: {
      nome: prefill?.nome ?? "",
      cpf: formatCpf(prefill?.cpf ?? ""),
      nascimento: prefill?.nascimento ?? "",
      email: "",
      celular: "",
      product: "Pessoal",
      amount: AMOUNT_DEFAULT,
    } as SimulationFormValues,
  });

  const product = form.watch("product");
  const amount = form.watch("amount");
  const installments = form.watch("installments");
  const dueDate = form.watch("dueDate");

  const today = new Date();
  const dueDateLimit = addDays(today, FIRST_INSTALLMENT_MAX_DAYS);
  const dueDay = dueDate?.getDate() ?? null;
  const rate = PRODUCT_RATE[product];
  const installmentAmount = installments
    ? calcInstallment(amount, installments, rate)
    : 0;

  function openDueDateDialog() {
    setDraftDueDate(dueDate);
    setDueDateDialogOpen(true);
  }

  function confirmDueDate() {
    if (!draftDueDate) return;
    form.setValue("dueDate", draftDueDate, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setDueDateDialogOpen(false);
  }

  function onContinue(values: SimulationFormValues) {
    onCompleted({
      id: crypto.randomUUID(),
      criadaEm: new Date().toLocaleString("pt-BR"),
      nome: values.nome,
      nascimento: values.nascimento,
      email: values.email,
      celular: values.celular,
      produto: values.product,
      taxa: PRODUCT_RATE[values.product],
      cpf: values.cpf,
      valor: values.amount,
      parcelas: values.installments,
      vencimento: values.dueDate.getDate(),
      parcelaCalc: calcInstallment(
        values.amount,
        values.installments,
        PRODUCT_RATE[values.product],
      ),
    });
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div className="mb-6">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          Simulação
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">
          Simule uma cotação de crédito para o cliente.
        </p>
        {hasList ? (
          <button
            type="button"
            onClick={onViewList}
            className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-navy"
          >
            <ArrowLeft size={14} />
            Ver lista de simulações
          </button>
        ) : null}
      </div>

      <section className="rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
        <Form {...form}>
          <form
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit(onContinue)}
            noValidate
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field, fieldState }) => (
                <InputField
                  label="Nome completo"
                  value={field.value}
                  onChange={field.onChange}
                  icon={<User size={16} />}
                  placeholder="Nome do cliente"
                  error={fieldState.error?.message}
                />
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field, fieldState }) => (
                <InputField
                  label="CPF"
                  value={field.value}
                  onChange={(value) => field.onChange(formatCpf(value))}
                  icon={<CreditCard size={16} />}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  error={
                    field.value.replace(/\D/g, "").length === 11
                      ? fieldState.error?.message
                      : undefined
                  }
                />
              )}
            />
            <FormField
              control={form.control}
              name="nascimento"
              render={({ field, fieldState }) => (
                <InputField
                  label="Data de nascimento"
                  value={field.value}
                  onChange={field.onChange}
                  icon={<CalendarDays size={16} />}
                  type="date"
                  error={field.value ? fieldState.error?.message : undefined}
                />
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <InputField
                  label="E-mail"
                  value={field.value}
                  onChange={field.onChange}
                  icon={<Mail size={16} />}
                  placeholder="cliente@email.com"
                  type="email"
                  error={fieldState.error?.message}
                />
              )}
            />
            <FormField
              control={form.control}
              name="celular"
              render={({ field, fieldState }) => (
                <InputField
                  label="Celular"
                  value={field.value}
                  onChange={(value) => field.onChange(formatPhone(value))}
                  icon={<Phone size={16} />}
                  placeholder="(11) 99999-0000"
                  inputMode="tel"
                  maxLength={15}
                  error={
                    field.value.replace(/\D/g, "").length >= 10
                      ? fieldState.error?.message
                      : undefined
                  }
                />
              )}
            />

            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-[#1A1D2E]">
                    Produto
                  </Label>
                  {!changingProduct ? (
                    <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#F5F6FA] px-4 py-3">
                      <div>
                        <span className="mb-1 inline-block rounded-full bg-[#FDF3E0] px-2 py-0.5 text-[11px] font-semibold text-[#854F0B]">
                          Sugerido
                        </span>
                        <p className="font-semibold text-[#1A1D2E]">
                          {field.value}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowRate((value) => !value)}
                          className="flex items-center gap-1 text-xs text-[#6B7080]"
                        >
                          {showRate ? <EyeOff size={12} /> : <Eye size={12} />}
                          {showRate
                            ? `Taxa de ${rate.toFixed(2).replace(".", ",")}% ao mês · definida pelo produto`
                            : "Mostrar taxa"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChangingProduct(true)}
                        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-navy"
                      >
                        <RefreshCw size={13} />
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <SelectField
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value as SimulationProduct);
                        setChangingProduct(false);
                      }}
                      options={toSelectOptions(PRODUCTS)}
                    />
                  )}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-[#1A1D2E]">
                    Quanto o cliente precisa?
                  </Label>
                  <p className="font-fraunces text-3xl font-bold text-brand-navy">
                    {fmtBRL(field.value)}
                  </p>
                  <input
                    type="range"
                    min={AMOUNT_MIN}
                    max={AMOUNT_MAX}
                    step={AMOUNT_STEP}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    className="w-full accent-brand-navy"
                  />
                  <div className="flex justify-between text-xs text-[#9DA3B4]">
                    <span>R$ 500</span>
                    <span>R$ 30.000</span>
                  </div>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-[#1A1D2E]">
                    Em quantas parcelas?
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {INSTALLMENT_OPTIONS.map((n) => (
                      <ChipButton
                        key={n}
                        active={field.value === n}
                        onClick={() => field.onChange(n)}
                      >
                        {n}x
                      </ChipButton>
                    ))}
                  </div>
                </div>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#1A1D2E]">
                Melhor dia de vencimento
              </Label>
              <p className="text-xs text-[#9DA3B4]">
                Vencimento sempre no dia 5, 10, 15 ou 20, dentro de uma janela
                de até {FIRST_INSTALLMENT_MAX_DAYS} dias (D+
                {FIRST_INSTALLMENT_MAX_DAYS}) a partir de hoje.
              </p>
              <button
                type="button"
                onClick={openDueDateDialog}
                className="flex items-center gap-2 rounded-2xl bg-[#F5F6FA] px-4 py-3 text-left transition-colors hover:bg-[#EFF0F5]"
              >
                <CalendarDays size={16} className="shrink-0 text-[#6B7080]" />
                <span
                  className={
                    dueDate ? "font-semibold text-[#1A1D2E]" : "text-[#9DA3B4]"
                  }
                >
                  {dueDate
                    ? dueDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Selecionar data"}
                </span>
              </button>
            </div>

            {installments && dueDay !== null ? (
              <div className="rounded-2xl bg-[#F5F6FA] px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[#6B7080]">Parcela</span>
                  <span className="font-fraunces text-xl font-bold text-[#1A1D2E]">
                    {fmtBRL(installmentAmount)}/mês
                  </span>
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="yellow"
              className="mt-0 h-11 w-full rounded-2xl"
              disabled={!form.formState.isValid}
            >
              Continuar
            </Button>
          </form>
        </Form>
      </section>

      <Dialog open={dueDateDialogOpen} onOpenChange={setDueDateDialogOpen}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Selecionar o dia de vencimento</DialogTitle>
            <DialogDescription>
              Sempre no dia 5, 10, 15 ou 20, dentro de uma janela de até{" "}
              {FIRST_INSTALLMENT_MAX_DAYS} dias a partir de hoje.
            </DialogDescription>
          </DialogHeader>
          <Calendar
            selected={draftDueDate}
            minDate={today}
            maxDate={dueDateLimit}
            isDayAllowed={isAllowedDueDate}
            onSelect={setDraftDueDate}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setDueDateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl font-semibold"
              disabled={!draftDueDate}
              onClick={confirmDueDate}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
