import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  PhoneOff,
  Handshake,
  Calendar,
  XCircle,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type CobrStage, CALL_OUTCOMES } from "@/features/dashboard/mocks/tasks";
import { useActionContext } from "@/contexts/action";

type Step = "outcome" | "boleto" | "obs";

const COBR_TITLES: Partial<Record<CobrStage, string>> = {
  initial: "Registrar ligação inicial",
  second_attempt: "Registrar 2ª tentativa",
  third_attempt: "Registrar 3ª tentativa",
  sem_previsao: "Registrar novo contato",
  promise: "Emitir boleto",
  fup: "FUP de promessa",
};

const outcomeIcons: Record<string, React.ReactNode> = {
  no_return_1: <PhoneOff size={18} />,
  no_return_2: <PhoneOff size={18} />,
  sem_previsao: <Calendar size={18} />,
  promise: <Handshake size={18} />,
  paid: <CheckCircle2 size={18} />,
  not_paid: <XCircle size={18} />,
};

function getOutcomeColor(
  value: string,
): "green" | "teal" | "amber" | "red" | "gray" {
  if (value === "paid") return "green";
  if (value === "promise") return "teal";
  if (value === "no_return_1" || value === "no_return_2") return "amber";
  if (value === "not_paid") return "red";
  return "gray";
}

const outcomeColors: Record<
  string,
  { bg: string; icon: string; border: string }
> = {
  green: {
    bg: "bg-success-bg",
    icon: "text-success",
    border: "border-success",
  },
  teal: {
    bg: "bg-brand-yellow/15",
    icon: "text-brand-navy",
    border: "border-brand-navy",
  },
  amber: {
    bg: "bg-warning-bg",
    icon: "text-warning",
    border: "border-warning",
  },
  red: {
    bg: "bg-destructive-bg",
    icon: "text-destructive",
    border: "border-destructive",
  },
  gray: {
    bg: "bg-muted",
    icon: "text-muted-foreground",
    border: "border-muted-foreground",
  },
};

export function RegisterCobrActionPage() {
  const navigate = useNavigate();
  const { client, cobrStage, onComplete, clearActionData } = useActionContext();
  const [step, setStep] = useState<Step>(
    cobrStage === "promise" ? "boleto" : "outcome",
  );
  const [outcome, setOutcome] = useState<string | null>(null);
  const [boletoValue, setBoletoValue] = useState(client?.value ?? "");
  const [boletoDate, setBoletoDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client || !cobrStage) {
      navigate(-1);
    }
  }, [client, cobrStage, navigate]);

  if (!client || !cobrStage) {
    return null;
  }

  const outcomes = CALL_OUTCOMES[cobrStage] ?? CALL_OUTCOMES.initial ?? [];
  const title = COBR_TITLES[cobrStage] ?? "Registrar ação";

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (step === "outcome") {
        if (!outcome) return;
        if (outcome === "promise") {
          setStep("boleto");
          return;
        }
        let nextStage: CobrStage = outcome as CobrStage;
        if (outcome === "no_return_1") nextStage = "second_attempt";
        if (outcome === "no_return_2") nextStage = "third_attempt";
        if (outcome === "not_paid") nextStage = "initial";
        onComplete({ nextStage, note });
        clearActionData();
        navigate(-1);
      } else if (step === "boleto") {
        onComplete({ nextStage: "fup", note });
        clearActionData();
        navigate(-1);
      } else {
        onComplete({ nextStage: cobrStage, note });
        clearActionData();
        navigate(-1);
      }
    }, 900);
  }

  const canSaveOutcome = step === "outcome" && outcome !== null;
  const canSaveBoleto = step === "boleto" && boletoDate !== "";

  return (
    <div className="min-h-screen flex-1 bg-background font-sans">
      {/* Header */}
      <div className="bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => {
              clearActionData();
              navigate(-1);
            }}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <h1 className="font-fraunces text-2xl font-bold text-white md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {client.name} · {client.parcela}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        {/* Client info card */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
            {client.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {client.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {client.contract} · {client.daysInfo}
            </p>
          </div>
          <span className="shrink-0 font-mono-dm text-lg font-semibold text-foreground">
            {client.value}
          </span>
        </div>

        {/* Step indicator */}
        {cobrStage !== "fup" && cobrStage !== "promise" && (
          <div className="mb-6 flex items-center gap-0">
            {["Resultado", "Observações"].map((s, i) => {
              const current = step === "outcome" ? 0 : 1;
              return (
                <div key={s} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      i < current
                        ? "text-success"
                        : i === current
                          ? "font-semibold text-brand-navy"
                          : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold ${
                        i < current
                          ? "border-success bg-success text-white"
                          : i === current
                            ? "border-brand-navy bg-brand-navy text-white"
                            : "border-muted-foreground/40 text-muted-foreground/40"
                      }`}
                    >
                      {i < current ? "✓" : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                  {i < 1 && <div className="mx-2 h-px w-8 bg-border" />}
                </div>
              );
            })}
          </div>
        )}

        {cobrStage === "fup" && (
          <div className="no-scrollbar mb-6 flex items-center gap-1 overflow-x-auto">
            {["Ligação", "Promessa", "Boleto", "FUP"].map((s, i) => (
              <div
                key={s}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i === 3
                    ? "bg-brand-navy text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {cobrStage === "promise" && (
          <div className="no-scrollbar mb-6 flex items-center gap-1 overflow-x-auto">
            {["Promessa", "Boleto", "FUP"].map((s, i) => (
              <div
                key={s}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i === 1
                    ? "bg-brand-navy text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Form content */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          {/* OUTCOME STEP */}
          {step === "outcome" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Qual foi o resultado da ligação?
              </p>
              {outcomes.map((o) => {
                const colorKey = getOutcomeColor(o.value);
                const colors = outcomeColors[colorKey];
                const selected = outcome === o.value;
                return (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => setOutcome(o.value)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      selected
                        ? `${colors.bg} ${colors.border}`
                        : "border-border bg-white hover:border-input hover:bg-background"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? `${colors.bg} ${colors.icon}`
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {outcomeIcons[o.value] || <CheckCircle2 size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          selected ? colors.icon : "text-foreground"
                        }`}
                      >
                        {o.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {o.desc}
                      </p>
                    </div>
                    {selected && (
                      <CheckCircle2 size={18} className={colors.icon} />
                    )}
                  </button>
                );
              })}
              <div className="mt-2">
                <Label>
                  Observações{" "}
                  <span className="font-normal text-muted-foreground/60">
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  placeholder="Descreva detalhes do contato…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 min-h-[76px]"
                />
              </div>
            </div>
          )}

          {/* BOLETO STEP */}
          {step === "boleto" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5 rounded-2xl bg-brand-yellow/15 p-3.5">
                <Handshake
                  size={16}
                  className="mt-0.5 shrink-0 text-brand-navy"
                />
                <p className="text-xs font-medium text-brand-navy">
                  Cliente fez promessa de pagamento. Emita o boleto e um FUP
                  será agendado automaticamente.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Valor do boleto</Label>
                  <Input
                    className="mt-1"
                    value={boletoValue}
                    onChange={(e) => setBoletoValue(e.target.value)}
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="flex-1">
                  <Label>Vencimento</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={boletoDate}
                    onChange={(e) => setBoletoDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>
                  Observações{" "}
                  <span className="font-normal text-muted-foreground/60">
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  className="mt-1 min-h-[72px]"
                  placeholder="Detalhes da promessa…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* OBS STEP */}
          {step === "obs" && (
            <div>
              <Label>Observações sobre o contato</Label>
              <Textarea
                className="mt-2 min-h-[120px]"
                placeholder="Descreva como foi a ligação…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-2">
          {step === "boleto" && (
            <Button
              variant="outline"
              className="h-12 rounded-2xl px-5"
              onClick={() => {
                setStep("outcome");
                setOutcome(null);
              }}
            >
              Voltar
            </Button>
          )}
          <Button
            className={`h-12 flex-1 gap-2 rounded-2xl font-semibold text-white ${
              step === "boleto"
                ? "bg-success hover:bg-success/90"
                : "bg-brand-navy hover:bg-brand-navy/90"
            }`}
            disabled={
              saving || (!canSaveOutcome && !canSaveBoleto && step !== "obs")
            }
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Salvando…
              </>
            ) : step === "boleto" ? (
              <>
                <Send size={15} />
                Emitir Boleto
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Registrar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
