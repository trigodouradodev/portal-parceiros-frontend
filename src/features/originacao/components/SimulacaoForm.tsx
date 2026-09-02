import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
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
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { OriginacaoToneBadge } from "@/features/originacao/components/OriginacaoSnapshotCard";
import {
  AMOUNT_DEFAULT,
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  FIRST_INSTALLMENT_MAX_DAYS,
  installmentOptionsForProduct,
  isAllowedDueDate,
  previewInstallmentAmount,
  productRatePercent,
  simulationFormDefaultsFromSnapshot,
  toIsoDate,
} from "@/features/originacao/data/simulacao";
import { useCreateSimulation } from "@/features/originacao/hooks/useCreateSimulation";
import { useUpdateSimulation } from "@/features/originacao/hooks/useUpdateSimulation";
import {
  createSimulationSchema,
  type SimulationFormValues,
} from "@/features/originacao/schemas/simulation-form";
import type {
  EligibilityPrefill,
  SimulationSnapshot,
} from "@/features/originacao/types";
import { useToast } from "@/contexts/toast/toast-context";
import { useProducts } from "@/hooks/useProducts";
import { useQuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatPhone, digitsOnlyPhone } from "@/lib/format/phone";
import { formatCpf } from "@/lib/format/tax-id";
import { fmtBRL } from "@/lib/utils";
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";
import { scrollToFirstError } from "@/features/originacao/utils/scroll-to-first-error";

interface SimulacaoFormProps {
  prefill: EligibilityPrefill | null;
  editing: SimulationSnapshot | null;
  hasList: boolean;
  onViewList: () => void;
  onCompleted: () => void;
}

const MAX_BIRTH_ISO = maxAdultBirthIso();
const SIMULATE_BLOCKED_MESSAGE =
  "Você possui ações de cobrança pendentes que impedem a simulação de proposta.";

export function SimulacaoForm({
  prefill,
  editing,
  hasList,
  onViewList,
  onCompleted,
}: SimulacaoFormProps) {
  const { showToast } = useToast();
  const productsQuery = useProducts();
  const permissionsQuery = useQuoteActivityPermissions();
  const createSimulation = useCreateSimulation();
  const updateSimulation = useUpdateSimulation();
  const products = useMemo(
    () =>
      (productsQuery.data ?? []).filter((product) => product.enabled !== false),
    [productsQuery.data],
  );
  const canSimulateQuote = permissionsQuery.data?.canSimulateQuote === true;
  const simulateBlocked = permissionsQuery.data?.canSimulateQuote === false;

  const [today] = useState(() => startOfDay(new Date()));
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState<Date | undefined>(undefined);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const constraintsRef = useRef({
    installmentOptions: installmentOptionsForProduct(null),
    today,
  });

  const form = useForm<SimulationFormValues>({
    resolver: (values, context, options) =>
      zodResolver(createSimulationSchema(constraintsRef.current))(
        values,
        context,
        options,
      ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: editing
      ? simulationFormDefaultsFromSnapshot(editing)
      : {
          name: prefill?.name ?? "",
          cpf: formatCpf(prefill?.cpf ?? ""),
          birthDate: prefill?.birthDate ?? "",
          email: "",
          phone: "",
          product: "",
          amount: AMOUNT_DEFAULT,
        },
  });

  const productId = form.watch("product");
  const amount = form.watch("amount");
  const installments = form.watch("installments");
  const dueDate = form.watch("dueDate");
  const selectedProduct = products.find((product) => product.id === productId);
  const installmentOptions = installmentOptionsForProduct(selectedProduct);
  const rate = productRatePercent(selectedProduct);
  constraintsRef.current = { installmentOptions, today };

  useEffect(() => {
    if (!products.length || form.getValues("product")) return;
    form.setValue("product", products[0].id, { shouldValidate: false });
  }, [form, products]);

  useEffect(() => {
    if (installments == null) return;
    if (installmentOptions.includes(installments)) return;
    if (editing && productsQuery.isLoading) return;
    form.setValue("installments", undefined as unknown as number, {
      shouldValidate: false,
    });
  }, [
    editing,
    form,
    installmentOptions,
    installments,
    productsQuery.isLoading,
  ]);

  const dueDateLimit = addDays(today, FIRST_INSTALLMENT_MAX_DAYS);
  const dueDay = dueDate?.getDate() ?? null;
  const installmentAmount = installments
    ? previewInstallmentAmount(amount, installments, rate)
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

  async function onContinue(values: SimulationFormValues) {
    if (!canSimulateQuote) {
      showToast(SIMULATE_BLOCKED_MESSAGE, { variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: values.name,
        document: values.cpf.replace(/\D/g, ""),
        birthDate: values.birthDate,
        email: values.email,
        telephone: digitsOnlyPhone(values.phone),
        productId: values.product,
        amount: values.amount,
        installments: values.installments,
        firstInstallmentDate: toIsoDate(values.dueDate),
      };

      if (editing) {
        await updateSimulation.mutateAsync({ id: editing.id, payload });
      } else {
        await createSimulation.mutateAsync(payload);
      }
      onCompleted();
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Não foi possível salvar a simulação."),
        { variant: "destructive" },
      );
    }
  }

  const submitting =
    form.formState.isSubmitting ||
    createSimulation.isPending ||
    updateSimulation.isPending;
  const submitDisabled =
    submitting ||
    !canSimulateQuote ||
    permissionsQuery.isPending ||
    productsQuery.isLoading ||
    products.length === 0;

  return (
    <OriginacaoPageFrame
      title={editing ? "Editar simulação" : "Simulação"}
      description={
        editing
          ? "Corrija os dados do cliente ou da cotação."
          : "Simule uma cotação de crédito para o cliente."
      }
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
          {simulateBlocked ? (
            <p className="rounded-2xl bg-destructive-bg px-4 py-3 text-sm text-destructive">
              {SIMULATE_BLOCKED_MESSAGE}
            </p>
          ) : null}

          <FormInput<SimulationFormValues>
            name="name"
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
            name="birthDate"
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
            name="phone"
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
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <FieldLabel required>Produto</FieldLabel>
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
                  <div>
                    {selectedProduct ? (
                      <OriginacaoToneBadge tone="warning">
                        Sugerido
                      </OriginacaoToneBadge>
                    ) : null}
                    <p className="font-semibold text-foreground">
                      {selectedProduct?.description ??
                        (productsQuery.isLoading
                          ? "Carregando produtos…"
                          : "Nenhum produto vinculado")}
                    </p>
                    {selectedProduct ? (
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
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductDialogOpen(true)}
                    disabled={!products.length}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-navy disabled:opacity-50"
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
                  onChange={field.onChange}
                  options={products.map((product) => ({
                    value: product.id,
                    label: product.description,
                  }))}
                />
                <FieldErrorMessage error={fieldState.error?.message} />
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
                options={installmentOptions.map((n) => ({
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

          <Button
            type="submit"
            variant="yellow"
            size="pill"
            className="w-full"
            disabled={submitDisabled}
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {editing ? "Salvando…" : "Simulando…"}
              </>
            ) : editing ? (
              "Salvar"
            ) : (
              "Continuar"
            )}
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
