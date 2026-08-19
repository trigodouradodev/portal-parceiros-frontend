import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/input-field";
import { isEligibleCpf } from "@/features/originacao/data/eligibility";
import { useOriginacao } from "@/features/originacao/originacao-context";
import {
  eligibilitySchema,
  type EligibilityFormValues,
} from "@/features/originacao/schemas/eligibility-form";
import { todayIsoLocal } from "@/features/originacao/utils/calc-age";
import { scrollToFirstError } from "@/features/originacao/utils/scroll-to-first-error";
import { formatCpf } from "@/lib/format/tax-id";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "valid" | "invalid";

const TODAY_ISO = todayIsoLocal();

const EMPTY_VALUES: EligibilityFormValues = {
  name: "",
  cpf: "",
  birthDate: "",
};

export function ElegibilidadePage() {
  const { setDadosIniciais, setActiveTab } = useOriginacao();
  const [status, setStatus] = useState<Status>("idle");

  const form = useForm<EligibilityFormValues>({
    resolver: zodResolver(eligibilitySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: EMPTY_VALUES,
  });

  const fieldsLocked = status === "loading" || status === "valid";

  function onConsultar(values: EligibilityFormValues) {
    if (status === "loading") return;
    setStatus("loading");
    window.setTimeout(() => {
      setStatus(isEligibleCpf(values.cpf) ? "valid" : "invalid");
    }, 1200);
  }

  function handleReset() {
    form.reset(EMPTY_VALUES);
    setStatus("idle");
  }

  function handleIniciarSimulacao() {
    const values = form.getValues();
    setDadosIniciais({
      nome: values.name,
      cpf: values.cpf,
      nascimento: values.birthDate,
    });
    setActiveTab("simulacao");
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:px-8 md:pb-8">
      <div className="mb-6 max-w-xl">
        <h2 className="font-fraunces text-xl font-bold text-[#1A1D2E]">
          Elegibilidade
        </h2>
        <p className="mt-1 text-sm text-[#6B7080]">
          Informe os dados do cliente para consultar a elegibilidade.
        </p>
      </div>

      <section className="max-w-xl rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onConsultar, scrollToFirstError)}
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <InputField
                  name={field.name}
                  label="Nome completo"
                  value={field.value}
                  onChange={field.onChange}
                  icon={<User size={16} />}
                  placeholder="Nome do cliente"
                  required
                  error={fieldState.error?.message}
                  disabled={fieldsLocked}
                />
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field, fieldState }) => (
                <InputField
                  name={field.name}
                  label="CPF"
                  value={field.value}
                  onChange={(value) => field.onChange(formatCpf(value))}
                  icon={<CreditCard size={16} />}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  required
                  error={fieldState.error?.message}
                  disabled={fieldsLocked}
                />
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field, fieldState }) => (
                <InputField
                  name={field.name}
                  label="Data de nascimento"
                  value={field.value}
                  onChange={field.onChange}
                  icon={<CalendarDays size={16} />}
                  type="date"
                  max={TODAY_ISO}
                  required
                  error={fieldState.error?.message}
                  disabled={fieldsLocked}
                />
              )}
            />

            {status === "idle" || status === "loading" ? (
              <Button
                type="submit"
                className="mt-1 h-11 w-full rounded-2xl font-semibold"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Consultando…
                  </>
                ) : (
                  "Consultar"
                )}
              </Button>
            ) : null}
          </form>
        </Form>

        {status === "valid" || status === "invalid" ? (
          <div className="mt-5 flex flex-col gap-3">
            <div
              role="status"
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-4",
                status === "valid"
                  ? "border-[#1D9E75] bg-[#E6F7F1] text-[#0F6E56]"
                  : "border-[#D84040] bg-[#FEECEC] text-[#A32D2D]",
              )}
            >
              {status === "valid" ? (
                <CheckCircle2 size={22} className="shrink-0" />
              ) : (
                <XCircle size={22} className="shrink-0" />
              )}
              <p className="font-fraunces text-lg font-bold">
                {status === "valid"
                  ? "Cliente elegível"
                  : "Cliente não elegível"}
              </p>
            </div>

            {status === "valid" ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={handleIniciarSimulacao}
              >
                Iniciar simulação
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-2xl"
              onClick={handleReset}
            >
              Consultar outro cliente
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
