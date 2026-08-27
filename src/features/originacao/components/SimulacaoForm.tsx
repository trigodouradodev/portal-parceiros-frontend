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
import { addDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChipField } from "@/components/ui/chip-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { Form, FormField } from "@/components/ui/form";
import { FormDate, FormInput } from "@/components/ui/rhf-fields";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { toSelectOptions } from "@/components/ui/select-option";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { OriginacaoToneBadge } from "@/features/originacao/components/OriginacaoSnapshotCard";
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
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";
import { scrollToFirstError } from "@/features/originacao/utils/scroll-to-first-error";

interface SimulacaoFormProps {
  prefill: DadosElegibilidade | null;
  hasList: boolean;
  onViewList: () => void;
  onCompleted: (snapshot: SimulacaoSnapshot) => void;
}

const MAX_BIRTH_ISO = maxAdultBirthIso();

export function SimulacaoForm({
  prefill,
  hasList,
  onViewList,
  onCompleted,
}: SimulacaoFormProps) {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState<Date | undefined>(undefined);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [showRate, setShowRate] = useState(false);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
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

  const today = startOfDay(new Date());
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
    <OriginacaoPageFrame
      title="Simulação"
      description="Simule uma cotação de crédito para o cliente."
      intro={
        hasList ? (
          <button
            type="button"
            onClick={onViewList}
            className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-navy"
          >
            <ArrowLeft size={14} />
            Ver lista de simulações
          </button>
        ) : null
      }
      card
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(onContinue, scrollToFirstError)}
          noValidate
        >
          <FormInput<SimulationFormValues>
            name="nome"
            label="Nome completo"
            icon={<User size={16} />}
            placeholder="Nome do cliente"
            required
          />
          <FormInput<SimulationFormValues>
            name="cpf"
            label="CPF"
            transform={formatCpf}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
          />
          <FormDate<SimulationFormValues>
            name="nascimento"
            label="Data de nascimento"
            max={MAX_BIRTH_ISO}
            captionLayout="dropdown"
            required
          />
          <FormInput<SimulationFormValues>
            name="email"
            label="E-mail"
            icon={<Mail size={16} />}
            placeholder="cliente@email.com"
            type="email"
            required
          />
          <FormInput<SimulationFormValues>
            name="celular"
            label="Celular"
            transform={formatPhone}
            icon={<Phone size={16} />}
            placeholder="(11) 99999-0000"
            inputMode="tel"
            maxLength={15}
            required
          />

          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FieldLabel required>Produto</FieldLabel>
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
                  <div>
                    <OriginacaoToneBadge tone="warning">
                      Sugerido
                    </OriginacaoToneBadge>
                    <p className="font-semibold text-foreground">
                      {field.value}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowRate((value) => !value)}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      {showRate ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showRate
                        ? `Taxa de ${formatMonthlyRate(rate)} · definida pelo produto`
                        : "Mostrar taxa"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductDialogOpen(true)}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-navy"
                  >
                    <RefreshCw size={13} />
                    Trocar
                  </button>
                </div>
                <SelectDialogField
                  hideTrigger
                  open={productDialogOpen}
                  onOpenChange={setProductDialogOpen}
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(value as SimulationProduct)
                  }
                  options={toSelectOptions(PRODUCTS)}
                />
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <FieldLabel required>Quanto o cliente precisa?</FieldLabel>
                <p className="font-display text-3xl font-bold text-brand-navy">
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ 500</span>
                  <span>R$ 30.000</span>
                </div>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="installments"
            render={({ field, fieldState }) => (
              <ChipField
                name={field.name}
                label="Em quantas parcelas?"
                value={field.value != null ? String(field.value) : ""}
                onChange={(value) => field.onChange(Number(value))}
                options={INSTALLMENT_OPTIONS.map((n) => ({
                  value: String(n),
                  label: `${n}x`,
                }))}
                chipsClassName="grid grid-cols-6 gap-2"
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ fieldState }) => (
              <div
                className="flex flex-col gap-1.5"
                {...fieldAnchorProps("dueDate", fieldState.error?.message)}
              >
                <FieldLabel required>Melhor dia de vencimento</FieldLabel>
                <FieldHint>
                  Vencimento sempre no dia 5, 10, 15 ou 20, dentro de uma janela
                  de até {FIRST_INSTALLMENT_MAX_DAYS} dias (D+
                  {FIRST_INSTALLMENT_MAX_DAYS}) a partir de hoje.
                </FieldHint>
                <button
                  type="button"
                  onClick={openDueDateDialog}
                  className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-left transition-colors hover:bg-muted/80"
                >
                  <CalendarDays
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                  <span
                    className={
                      dueDate
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground/70"
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
                <FieldErrorMessage error={fieldState.error?.message} />
              </div>
            )}
          />

          {installments && dueDay !== null ? (
            <div className="rounded-2xl bg-muted px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Parcela</span>
                <span className="font-display text-xl font-bold text-foreground">
                  {fmtBRL(installmentAmount)}/mês
                </span>
              </div>
            </div>
          ) : null}

          <Button type="submit" variant="yellow" size="pill" className="w-full">
            Continuar
          </Button>
        </form>
      </Form>

      <Dialog open={dueDateDialogOpen} onOpenChange={setDueDateDialogOpen}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Selecionar o dia de vencimento</DialogTitle>
            <DialogDescription>
              Sempre no dia 5, 10, 15 ou 20, dentro de uma janela de até{" "}
              {FIRST_INSTALLMENT_MAX_DAYS} dias a partir de hoje.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={draftDueDate}
              onSelect={setDraftDueDate}
              disabled={[
                { before: today },
                { after: dueDateLimit },
                (date) => !isAllowedDueDate(date),
              ]}
              className="rounded-lg border"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="pillSm"
              onClick={() => setDueDateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="pillSm"
              disabled={!draftDueDate}
              onClick={confirmDueDate}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OriginacaoPageFrame>
  );
}
