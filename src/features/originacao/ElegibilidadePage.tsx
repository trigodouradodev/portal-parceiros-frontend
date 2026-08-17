import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { isEligibleCpf } from "@/features/originacao/data/eligibility";
import { useOriginacao } from "@/features/originacao/originacao-context";
import { formatCpf } from "@/features/originacao/utils/format-cpf";
import {
  calcAge,
  isAdultAge,
  todayIsoLocal,
} from "@/features/originacao/utils/calc-age";
import { isValidCpf } from "@/features/originacao/utils/is-valid-cpf";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "valid" | "invalid";

const TODAY_ISO = todayIsoLocal();

export function ElegibilidadePage() {
  const { setDadosIniciais, setActiveTab } = useOriginacao();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfComplete = cpfDigits.length === 11;
  const cpfValid = isValidCpf(cpf);
  const cpfError = cpfComplete && !cpfValid ? "CPF inválido" : undefined;

  const age = calcAge(birthDate);
  const birthDateValid = isAdultAge(age);
  const birthDateError =
    birthDate.trim() !== "" && !birthDateValid
      ? "O cliente deve ter entre 18 e 120 anos."
      : undefined;

  const canSubmit = name.trim() !== "" && cpfValid && birthDateValid;

  function handleConsultar() {
    if (!canSubmit || status === "loading") return;
    setStatus("loading");
    window.setTimeout(() => {
      setStatus(isEligibleCpf(cpf) ? "valid" : "invalid");
    }, 1200);
  }

  function handleReset() {
    setName("");
    setCpf("");
    setBirthDate("");
    setStatus("idle");
  }

  function handleIniciarSimulacao() {
    setDadosIniciais({ nome: name, cpf, nascimento: birthDate });
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
        <div className="flex flex-col gap-4">
          <InputField
            label="Nome completo"
            value={name}
            onChange={setName}
            icon={<User size={16} />}
            placeholder="Nome do cliente"
            disabled={status === "loading" || status === "valid"}
          />
          <InputField
            label="CPF"
            value={cpf}
            onChange={(v) => setCpf(formatCpf(v))}
            icon={<CreditCard size={16} />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            error={cpfError}
            disabled={status === "loading" || status === "valid"}
          />
          <InputField
            label="Data de nascimento"
            value={birthDate}
            onChange={setBirthDate}
            icon={<CalendarDays size={16} />}
            type="date"
            max={TODAY_ISO}
            error={birthDateError}
            disabled={status === "loading" || status === "valid"}
          />
        </div>

        {status === "idle" || status === "loading" ? (
          <Button
            type="button"
            className="mt-5 h-11 w-full rounded-2xl font-semibold"
            disabled={!canSubmit || status === "loading"}
            onClick={handleConsultar}
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
        ) : (
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
        )}
      </section>
    </div>
  );
}
