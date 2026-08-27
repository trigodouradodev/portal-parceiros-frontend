import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CreditCard, Loader2, User, XCircle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormDate, FormInput } from "@/components/ui/rhf-fields";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { isEligibleCpf } from "@/features/originacao/data/eligibility";
import { useOriginacao } from "@/features/originacao/originacao-context";
import {
  eligibilitySchema,
  type EligibilityFormValues,
} from "@/features/originacao/schemas/eligibility-form";
import { maxAdultBirthIso } from "@/features/originacao/utils/calc-age";
import { scrollToFirstError } from "@/features/originacao/utils/scroll-to-first-error";
import { formatCpf } from "@/lib/format/tax-id";

type Status = "idle" | "loading" | "valid" | "invalid";

const MAX_BIRTH_ISO = maxAdultBirthIso();

const EMPTY_VALUES: EligibilityFormValues = {
  name: "",
  cpf: "",
  birthDate: "",
};

export function ElegibilidadePage() {
  const { setEligibilityPrefill, setActiveTab } = useOriginacao();
  const [status, setStatus] = useState<Status>("idle");

  const form = useForm<EligibilityFormValues>({
    resolver: zodResolver(eligibilitySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: EMPTY_VALUES,
  });

  const fieldsLocked = status === "loading" || status === "valid";

  function onSubmitEligibility(values: EligibilityFormValues) {
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

  function handleStartSimulation() {
    const values = form.getValues();
    setEligibilityPrefill({
      name: values.name,
      cpf: values.cpf,
      birthDate: values.birthDate,
    });
    setActiveTab("simulation");
  }

  return (
    <OriginacaoPageFrame
      title="Elegibilidade"
      description="Informe os dados do cliente para consultar a elegibilidade."
      card
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(onSubmitEligibility, scrollToFirstError)}
          noValidate
        >
          <FormInput<EligibilityFormValues>
            name="name"
            label="Nome completo"
            icon={<User size={16} />}
            placeholder="Nome do cliente"
            required
            disabled={fieldsLocked}
          />
          <FormInput<EligibilityFormValues>
            name="cpf"
            label="CPF"
            transform={formatCpf}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            disabled={fieldsLocked}
          />
          <FormDate<EligibilityFormValues>
            name="birthDate"
            label="Data de nascimento"
            max={MAX_BIRTH_ISO}
            captionLayout="dropdown"
            required
            disabled={fieldsLocked}
          />

          {status === "idle" || status === "loading" ? (
            <Button
              type="submit"
              size="pill"
              className="mt-1 w-full"
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
          <Alert variant={status === "valid" ? "success" : "destructive"}>
            {status === "valid" ? (
              <CheckCircle2 size={22} />
            ) : (
              <XCircle size={22} />
            )}
            <AlertTitle className="font-display text-lg font-bold">
              {status === "valid" ? "Cliente elegível" : "Cliente não elegível"}
            </AlertTitle>
          </Alert>

          {status === "valid" ? (
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={handleStartSimulation}
            >
              Iniciar simulação
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="pill"
            onClick={handleReset}
          >
            Consultar outro cliente
          </Button>
        </div>
      ) : null}
    </OriginacaoPageFrame>
  );
}
