import { zodResolver } from "@hookform/resolvers/zod";
import { startOfDay } from "date-fns";
import { Loader2, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChipField } from "@/components/ui/chip-field";
import { Form, FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { useToast } from "@/contexts/toast/toast-context";
import { OriginacaoTaskHeader } from "@/features/originacao/components/OriginacaoTaskHeader";
import { OriginacaoTaskLayout } from "@/features/originacao/components/OriginacaoTaskLayout";
import { SimulationDueDateField } from "@/features/originacao/components/simulacao/SimulationDueDateField";
import { SimulationProductField } from "@/features/originacao/components/simulacao/SimulationProductField";
import type { ProposalSnapshot } from "@/features/originacao/data/proposal";
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  installmentOptionsForProduct,
  simulationFormDefaultsFromSnapshot,
  toIsoDate,
} from "@/features/originacao/data/simulacao";
import { useUpdateDraftSimulation } from "@/features/originacao/hooks/useUpdateDraftSimulation";
import {
  createDraftSimulationSchema,
  type DraftSimulationFormValues,
} from "@/features/originacao/schemas/simulation-form";
import { scrollToFirstError } from "@/features/originacao/utils/scroll-to-first-error";
import { useProducts } from "@/hooks/useProducts";
import { getApiErrorMessage } from "@/lib/api/errors";
import { fmtBRL, formatMoneyBrl, parseMoneyBrl } from "@/lib/format/money";
import type { QuoteDraftSimulationSnapshot } from "@/services/quotes/quotes.types";

interface ProposalSimulationEditProps {
  proposal: ProposalSnapshot;
  onCancel: () => void;
  onSaved: (update: QuoteDraftSimulationSnapshot) => void;
}

/**
 * Edição do produto, valor, prazo e primeira parcela de uma proposta em
 * rascunho (AUREA-701). O backend refaz a Celcoin e a cotação do seguro; CPF e
 * dados pessoais continuam no passo Cadastro.
 */
export function ProposalSimulationEdit({
  proposal,
  onCancel,
  onSaved,
}: ProposalSimulationEditProps) {
  const { simulation } = proposal;
  const { showToast } = useToast();
  const productsQuery = useProducts();
  const updateSimulation = useUpdateDraftSimulation(proposal.id);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [today] = useState(() => startOfDay(new Date()));

  const products = useMemo(
    () =>
      (productsQuery.data ?? []).filter((product) => product.enabled !== false),
    [productsQuery.data],
  );

  const constraintsRef = useRef({
    installmentOptions: installmentOptionsForProduct(null),
    today,
  });
  const form = useForm<DraftSimulationFormValues>({
    resolver: (values, context, options) =>
      zodResolver(createDraftSimulationSchema(constraintsRef.current))(
        values,
        context,
        options,
      ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: draftFormDefaults(simulation),
  });

  const productId = useWatch({ control: form.control, name: "product" });
  const selectedProduct = products.find((product) => product.id === productId);
  const installmentOptions = useMemo(
    () => installmentOptionsForProduct(selectedProduct),
    [selectedProduct],
  );

  useEffect(() => {
    constraintsRef.current = { installmentOptions, today };
  }, [installmentOptions, today]);

  const installments = useWatch({
    control: form.control,
    name: "installments",
  });

  // Produto novo com outra faixa de prazo: limpa a parcela que deixou de existir.
  useEffect(() => {
    if (productsQuery.isLoading || installments == null) return;
    if (installmentOptions.includes(installments)) return;
    form.setValue("installments", undefined as unknown as number, {
      shouldValidate: false,
    });
  }, [form, installmentOptions, installments, productsQuery.isLoading]);

  async function handleSave(values: DraftSimulationFormValues) {
    setSaveError(null);
    try {
      const update = await updateSimulation.mutateAsync({
        productId: values.product,
        amount: values.amount,
        installments: values.installments,
        firstInstallmentDate: toIsoDate(values.dueDate),
      });
      showToast(
        "Simulação atualizada. Confirme de novo os passos Financeiro e Documentação.",
      );
      onSaved(update);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Não foi possível atualizar a simulação.",
      );
      setSaveError(message);
      showToast(message, { variant: "destructive" });
    }
  }

  return (
    <OriginacaoTaskLayout
      header={
        <OriginacaoTaskHeader
          title="Editar simulação"
          subtitle={simulation.name}
          backLabel="Voltar para a proposta"
          onBack={onCancel}
        />
      }
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(handleSave, scrollToFirstError)}
          noValidate
        >
          <p className="rounded-2xl bg-warning-bg px-4 py-3 text-sm text-warning-foreground">
            O seguro será cotado de novo com as novas condições. Depois de
            salvar, confirme novamente os passos Financeiro e Documentação.
          </p>

          <SimulationProductField
            products={products}
            productsLoading={productsQuery.isLoading}
            suggestedProductId={undefined}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <InputField
                name={field.name}
                label="Quanto o cliente precisa?"
                inputMode="numeric"
                placeholder="R$ 0,00"
                required
                value={Number.isFinite(field.value) ? fmtBRL(field.value) : ""}
                onChange={(value) => {
                  const masked = formatMoneyBrl(value);
                  field.onChange(
                    masked === "" ? Number.NaN : parseMoneyBrl(masked),
                  );
                }}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                hint={`De ${fmtBRL(AMOUNT_MIN)} a ${fmtBRL(AMOUNT_MAX)}, em múltiplos de R$ 100,00.`}
              />
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

          {saveError ? (
            <Alert variant="destructive">
              <XCircle size={22} />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              variant="yellow"
              size="pill"
              className="w-full"
              disabled={updateSimulation.isPending}
            >
              {updateSimulation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Recalculando…
                </>
              ) : (
                "Salvar e recalcular"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="pill"
              className="w-full"
              onClick={onCancel}
              disabled={updateSimulation.isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </OriginacaoTaskLayout>
  );
}

function draftFormDefaults(
  simulation: ProposalSnapshot["simulation"],
): DraftSimulationFormValues {
  const { product, amount, installments, dueDate } =
    simulationFormDefaultsFromSnapshot(simulation);
  return { product, amount, installments, dueDate };
}
