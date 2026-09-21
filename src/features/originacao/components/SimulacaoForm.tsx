import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { startOfDay } from "date-fns";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChipField } from "@/components/ui/chip-field";
import { FieldLabel, FieldStatusMessage } from "@/components/ui/field-hint";
import { Form, FormField } from "@/components/ui/form";
import { FormDate, FormInput } from "@/components/ui/rhf-fields";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { SimulationDueDateField } from "@/features/originacao/components/simulacao/SimulationDueDateField";
import { SimulationProductField } from "@/features/originacao/components/simulacao/SimulationProductField";
import { SimulationResultCard } from "@/features/originacao/components/simulacao/SimulationResultCard";
import { CREATE_QUOTE_BLOCKED_MESSAGE } from "@/features/originacao/constants/simulacao-list";
import {
  AMOUNT_DEFAULT,
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  installmentOptionsForProduct,
  isSimulationConverted,
  simulationFormDefaultsFromSnapshot,
  toIsoDate,
} from "@/features/originacao/data/simulacao";
import { useSimulate } from "@/features/originacao/hooks/useSimulate";
import { useSimulationPartyAutoFill } from "@/features/originacao/hooks/useSimulationPartyAutoFill";
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
import { isValidCpf } from "@/lib/validation/cpf";
import { fmtBRL } from "@/lib/utils";
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { scrollToFirstError } from "@/features/originacao/utils/scroll-to-first-error";

interface SimulacaoFormProps {
  prefill: EligibilityPrefill | null;
  editing: SimulationSnapshot | null;
  hasList: boolean;
  onViewList: () => void;
  onStartProposal: (snapshot: SimulationSnapshot) => void | Promise<void>;
}

const MAX_BIRTH_ISO = maxAdultBirthIso();
const SIMULATE_BLOCKED_MESSAGE =
  "Você possui ações de cobrança pendentes que impedem a simulação de proposta.";

export function SimulacaoForm({
  prefill,
  editing,
  hasList,
  onViewList,
  onStartProposal,
}: SimulacaoFormProps) {
  const { showToast } = useToast();
  const productsQuery = useProducts();
  const permissionsQuery = useQuoteActivityPermissions();
  const simulate = useSimulate();
  const products = useMemo(
    () =>
      (productsQuery.data ?? []).filter((product) => product.enabled !== false),
    [productsQuery.data],
  );
  const canSimulateQuote = permissionsQuery.data?.canSimulateQuote === true;
  const simulateBlocked = permissionsQuery.data?.canSimulateQuote === false;
  const canCreateQuote = permissionsQuery.data?.canCreateQuote === true;
  const createQuoteBlocked = permissionsQuery.data?.canCreateQuote === false;
  const [persistedSimulation, setPersistedSimulation] =
    useState<SimulationSnapshot | null>(editing);
  const [ineligible, setIneligible] = useState(false);
  const [startingProposal, setStartingProposal] = useState(false);
  const converted =
    persistedSimulation != null && isSimulationConverted(persistedSimulation);

  const [today] = useState(() => startOfDay(new Date()));
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
  const {
    status: partyLookupStatus,
    onCpfComplete,
    onCpfIncomplete,
  } = useSimulationPartyAutoFill(form.setValue, {
    lookupOnMountCpf: editing ? undefined : prefill?.cpf,
  });

  function handleCpfChange(formatted: string) {
    if (isValidCpf(formatted)) {
      onCpfComplete(formatted.replace(/\D/g, ""));
    } else {
      onCpfIncomplete();
    }
  }

  const productId = form.watch("product");
  const installments = form.watch("installments");
  const suggestedProductId = products[0]?.id;
  const selectedProduct = products.find((product) => product.id === productId);
  const installmentOptions = useMemo(
    () => installmentOptionsForProduct(selectedProduct),
    [
      selectedProduct?.minInstallmentCount,
      selectedProduct?.maxInstallmentCount,
    ],
  );
  constraintsRef.current = { installmentOptions, today };

  // Default sugerido só se o campo ainda estiver vazio (edição / Trocar não passam por aqui).
  useEffect(() => {
    if (!suggestedProductId || form.getValues("product")) return;
    form.setValue("product", suggestedProductId, { shouldValidate: false });
  }, [form, suggestedProductId]);

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

  useEffect(() => {
    const subscription = form.watch(() => setIneligible(false));
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSimulate(values: SimulationFormValues) {
    if (!canSimulateQuote) {
      showToast(SIMULATE_BLOCKED_MESSAGE, { variant: "destructive" });
      return;
    }

    try {
      setIneligible(false);
      const result = await simulate.mutateAsync({
        ...(persistedSimulation
          ? { simulationId: persistedSimulation.id }
          : {}),
        name: values.name,
        document: values.cpf.replace(/\D/g, ""),
        birthDate: values.birthDate,
        email: values.email,
        telephone: digitsOnlyPhone(values.phone),
        productId: values.product,
        amount: values.amount,
        installments: values.installments,
        firstInstallmentDate: toIsoDate(values.dueDate),
      });

      if (!result.eligible) {
        setIneligible(true);
        return;
      }

      setPersistedSimulation(result.simulation);
      form.reset(simulationFormDefaultsFromSnapshot(result.simulation));
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Não foi possível realizar a simulação."),
        { variant: "destructive" },
      );
    }
  }

  const freshSimulation =
    persistedSimulation != null && !form.formState.isDirty && !ineligible
      ? persistedSimulation
      : null;
  const canStartProposal =
    canCreateQuote && freshSimulation != null && !converted;

  async function handleStartProposal() {
    if (!canStartProposal || !freshSimulation) {
      if (createQuoteBlocked) {
        showToast(CREATE_QUOTE_BLOCKED_MESSAGE, { variant: "destructive" });
      }
      return;
    }

    setStartingProposal(true);
    try {
      await onStartProposal(freshSimulation);
    } finally {
      setStartingProposal(false);
    }
  }

  const submitting = form.formState.isSubmitting || simulate.isPending;
  const submitDisabled =
    submitting ||
    !canSimulateQuote ||
    converted ||
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
          onSubmit={form.handleSubmit(onSimulate, scrollToFirstError)}
          noValidate
        >
          {simulateBlocked ? (
            <p className="rounded-2xl bg-destructive-bg px-4 py-3 text-sm text-destructive">
              {SIMULATE_BLOCKED_MESSAGE}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <FormInput<SimulationFormValues>
              name="cpf"
              label="CPF"
              transform={formatCpf}
              onValueChange={handleCpfChange}
              icon={<CreditCard size={16} />}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              required
            />
            {partyLookupStatus === "searching" ? (
              <FieldStatusMessage tone="pending">
                Buscando cadastro…
              </FieldStatusMessage>
            ) : null}
            {partyLookupStatus === "found" ? (
              <FieldStatusMessage tone="success">
                Cadastro encontrado e preenchido automaticamente
              </FieldStatusMessage>
            ) : null}
          </div>
          <FormInput<SimulationFormValues>
            name="name"
            label="Nome completo"
            icon={<User size={16} />}
            placeholder="Nome do cliente"
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

          <SimulationProductField
            products={products}
            productsLoading={productsQuery.isLoading}
            suggestedProductId={suggestedProductId}
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

          <SimulationDueDateField today={today} />

          {ineligible ? (
            <Alert variant="destructive">
              <XCircle size={22} />
              <AlertTitle className="font-display text-lg font-bold">
                Cliente não elegível
              </AlertTitle>
            </Alert>
          ) : null}

          {persistedSimulation && form.formState.isDirty ? (
            <p className="rounded-2xl bg-warning-bg px-4 py-3 text-sm text-warning-foreground">
              Os dados foram alterados. Simule novamente para atualizar o
              resultado.
            </p>
          ) : null}

          {freshSimulation ? (
            <SimulationResultCard simulation={freshSimulation} />
          ) : null}

          {createQuoteBlocked && !simulateBlocked && !converted ? (
            <p className="rounded-2xl bg-destructive-bg px-4 py-3 text-sm text-destructive">
              {CREATE_QUOTE_BLOCKED_MESSAGE}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              variant={freshSimulation ? "outline" : "yellow"}
              size="pill"
              className="w-full"
              disabled={submitDisabled}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Simulando…
                </>
              ) : persistedSimulation ? (
                "Simular novamente"
              ) : (
                "Simular"
              )}
            </Button>
            {freshSimulation && !converted ? (
              <Button
                type="button"
                variant="yellow"
                size="pill"
                className="w-full"
                disabled={!canStartProposal || startingProposal}
                onClick={handleStartProposal}
              >
                {startingProposal ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Iniciando…
                  </>
                ) : (
                  "Iniciar proposta"
                )}
              </Button>
            ) : null}
          </div>
        </form>
      </Form>
    </OriginacaoPageFrame>
  );
}
