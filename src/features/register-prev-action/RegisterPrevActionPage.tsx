import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  PhoneOff,
  Handshake,
  Calendar,
  MessageSquare,
  Phone,
  MapPin,
  Loader2,
  ChevronRight,
  Navigation,
  AlertTriangle,
  MapPinOff,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActionContext } from "@/contexts/action";

type PrevChannel = "whatsapp" | "phone" | "visit";
type Step = "channel" | "channel_action" | "outcome";
type LocationStatus = "idle" | "checking" | "confirmed" | "not_found" | "manual";

function getWaTemplates(client: {
  name: string;
  parcela: string;
  daysInfo: string;
}) {
  const name = client.name.split(" ")[0];
  const parcela = client.parcela;
  const { daysInfo } = client;

  if (daysInfo === "Vence hoje")
    return [
      {
        tag: "Amigável",
        message: `Olá, ${name}! 👋 Passando para lembrar que hoje é o dia do vencimento da sua parcela Aurea (${parcela}). Caso já tenha pago, desconsidere. Qualquer dúvida, estou aqui!`,
      },
      {
        tag: "Formal",
        message: `Prezado(a) ${name}, informamos que a parcela ${parcela} do seu contrato Aurea vence hoje. Por gentileza, verifique se o pagamento foi efetuado. Obrigado.`,
      },
    ];
  if (daysInfo === "Vence em 2 dias")
    return [
      {
        tag: "Amigável",
        message: `Oi, ${name}! 😊 Aqui é da Aurea. Sua parcela (${parcela}) vence em 2 dias. Se precisar de qualquer informação sobre o pagamento, pode me chamar!`,
      },
      {
        tag: "Formal",
        message: `Olá, ${name}. Lembrete: sua parcela Aurea (${parcela}) vence em 2 dias. Em caso de dúvidas, entre em contato. Obrigado!`,
      },
    ];
  return [
    {
      tag: "Amigável",
      message: `Olá, ${name}! 👋 Aqui é da Aurea. Passando para lembrar que a parcela ${parcela} do seu contrato vence em breve. Qualquer dúvida, é só chamar!`,
    },
    {
      tag: "Formal",
      message: `Prezado(a) ${name}, notificação antecipada: a parcela ${parcela} do seu contrato Aurea tem vencimento próximo. Em caso de dúvidas, entre em contato.`,
    },
  ];
}

const PREV_OUTCOMES = [
  {
    value: "confirmed",
    label: "Pagará no dia",
    desc: "Cliente confirmou que pagará",
    icon: <CheckCircle2 size={18} />,
    color: "green",
  },
  {
    value: "no_return",
    label: "Sem retorno",
    desc: "Não atendeu / não respondeu",
    icon: <PhoneOff size={18} />,
    color: "amber",
  },
  {
    value: "delay",
    label: "Pediu prazo extra",
    desc: "Precisa de alguns dias a mais",
    icon: <Calendar size={18} />,
    color: "amber",
  },
  {
    value: "renegotiate",
    label: "Quer renegociar",
    desc: "Quer alterar condições",
    icon: <Handshake size={18} />,
    color: "blue",
  },
];

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
  blue: {
    bg: "bg-brand-yellow/15",
    icon: "text-brand-navy",
    border: "border-brand-navy",
  },
};

export function RegisterPrevActionPage() {
  const navigate = useNavigate();
  const { client, onComplete, clearActionData } = useActionContext();
  const [step, setStep] = useState<Step>("channel");
  const [channel, setChannel] = useState<PrevChannel | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [selectedMsg, setSelectedMsg] = useState(0);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  useEffect(() => {
    if (!client) {
      navigate(-1);
    }
  }, [client, navigate]);

  if (!client) {
    return null;
  }

  const waTemplates = getWaTemplates(client);
  const mockPhone = client.phone ?? "(11) 98765-4321";
  const mockAddress = client.address ?? "Rua das Flores, 42 – Centro";

  const titles: Record<Step, string> = {
    channel: "Tipo de contato",
    channel_action:
      channel === "whatsapp"
        ? "Mensagem WhatsApp"
        : channel === "phone"
          ? "Ligar para o cliente"
          : "Verificar localização",
    outcome: "Resultado do contato",
  };

  const prevStep = step === "channel" ? 0 : step === "channel_action" ? 1 : 2;

  function handleCopy(idx: number) {
    navigator.clipboard?.writeText(waTemplates[idx].message).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  function simulateLocationCheck() {
    setLocationStatus("checking");
    setTimeout(() => {
      setLocationStatus(Math.random() > 0.5 ? "confirmed" : "not_found");
    }, 1800);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onComplete({
        channel: channel ?? undefined,
        outcome: outcome ?? undefined,
        note,
        status: outcome ?? "Contato realizado",
      });
      clearActionData();
      navigate(-1);
    }, 900);
  }

  const locationOk =
    locationStatus === "confirmed" || locationStatus === "manual";
  const canSaveOutcome = step === "outcome" && outcome !== null;

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
            {titles[step]}
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
        <div className="mb-6 flex items-center gap-0">
          {["Canal", "Ação", "Resultado"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 text-xs ${
                  i < prevStep
                    ? "text-success"
                    : i === prevStep
                      ? "font-semibold text-brand-navy"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold ${
                    i < prevStep
                      ? "border-success bg-success text-white"
                      : i === prevStep
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-muted-foreground/40 text-muted-foreground/40"
                  }`}
                >
                  {i < prevStep ? "✓" : i + 1}
                </div>
                <span>{s}</span>
              </div>
              {i < 2 && <div className="mx-2 h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        {/* Form content */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          {/* CHANNEL STEP */}
          {step === "channel" && (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Qual tipo de contato você vai realizar?
              </p>
              <div className="flex flex-col gap-2">
                {(
                  [
                    {
                      value: "whatsapp",
                      label: "WhatsApp",
                      desc: "Enviar mensagem prédefinida",
                      icon: <MessageSquare size={20} />,
                    },
                    {
                      value: "phone",
                      label: "Ligação",
                      desc: "Ligar para o cliente agora",
                      icon: <Phone size={20} />,
                    },
                    {
                      value: "visit",
                      label: "Visita",
                      desc: "Visitar o cliente presencialmente",
                      icon: <MapPin size={20} />,
                    },
                  ] as {
                    value: PrevChannel;
                    label: string;
                    desc: string;
                    icon: React.ReactNode;
                  }[]
                ).map((ch) => (
                  <button
                    type="button"
                    key={ch.value}
                    onClick={() => setChannel(ch.value)}
                    className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      channel === ch.value
                        ? "border-brand-navy bg-brand-yellow/10"
                        : "border-border bg-white hover:border-input hover:bg-background"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        channel === ch.value
                          ? "bg-brand-navy text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ch.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          channel === ch.value
                            ? "text-brand-navy"
                            : "text-foreground"
                        }`}
                      >
                        {ch.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ch.desc}
                      </p>
                    </div>
                    {channel === ch.value && (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-brand-navy"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHANNEL ACTION STEP — WhatsApp */}
          {step === "channel_action" && channel === "whatsapp" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Selecione uma mensagem e envie pelo WhatsApp.
              </p>
              {waTemplates.map((tpl, idx) => (
                <div
                  key={tpl.tag}
                  onClick={() => setSelectedMsg(idx)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    selectedMsg === idx
                      ? "border-brand-navy bg-brand-yellow/10"
                      : "border-border bg-white hover:border-input"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        selectedMsg === idx
                          ? "bg-brand-navy text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tpl.tag}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(idx);
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-brand-navy"
                    >
                      {copied === idx ? (
                        <>
                          <CheckCircle2 size={12} className="text-success" />
                          <span className="text-success">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {tpl.message}
                  </p>
                </div>
              ))}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
                onClick={() =>
                  window.alert("Abrirá o WhatsApp com a mensagem selecionada.")
                }
              >
                <MessageSquare size={18} />
                Abrir WhatsApp com esta mensagem
                <ExternalLink size={14} className="opacity-70" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Após enviar, avance para registrar o resultado.
              </p>
            </div>
          )}

          {/* CHANNEL ACTION STEP — Ligação */}
          {step === "channel_action" && channel === "phone" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-2xl bg-background p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    Telefone cadastrado
                  </p>
                  <p className="font-mono-dm text-base font-bold text-foreground">
                    {mockPhone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-4 text-base font-semibold text-white transition-colors hover:bg-brand-navy/90"
                onClick={() =>
                  window.alert(`Iniciará ligação para ${mockPhone}`)
                }
              >
                <Phone size={20} />
                Ligar agora para {client.name.split(" ")[0]}
                <ExternalLink size={14} className="opacity-70" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Após a ligação, avance para registrar o resultado.
              </p>
            </div>
          )}

          {/* CHANNEL ACTION STEP — Visita */}
          {step === "channel_action" && channel === "visit" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-2xl bg-background p-4">
                <MapPin size={18} className="mt-0.5 shrink-0 text-brand-navy" />
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    Endereço do cliente
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {mockAddress}
                  </p>
                </div>
              </div>

              {locationStatus === "idle" && (
                <button
                  type="button"
                  onClick={simulateLocationCheck}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-4 font-semibold text-white transition-colors hover:bg-brand-navy/90"
                >
                  <Navigation size={18} />
                  Verificar minha localização
                </button>
              )}

              {locationStatus === "checking" && (
                <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-muted py-4 font-semibold text-muted-foreground">
                  <Loader2 size={18} className="animate-spin" />
                  Verificando localização…
                </div>
              )}

              {locationStatus === "confirmed" && (
                <div className="flex flex-col gap-3">
                  <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-success-bg py-4 font-semibold text-success">
                    <CheckCircle2 size={18} />
                    Localização confirmada — você está no endereço!
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Avance para registrar o resultado da visita.
                  </p>
                </div>
              )}

              {locationStatus === "manual" && (
                <div className="flex flex-col gap-3">
                  <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-yellow/20 py-4 font-semibold text-brand-navy">
                    <CheckCircle2 size={18} />
                    Presença confirmada manualmente
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Avance para registrar o resultado da visita.
                  </p>
                </div>
              )}

              {locationStatus === "not_found" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive-bg p-4">
                    <MapPinOff
                      size={18}
                      className="mt-0.5 shrink-0 text-destructive"
                    />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Você não está no endereço do cliente
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Para registrar a visita, vá ao endereço ou confirme
                        presença manualmente.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      window.alert("Abrirá o GPS com rota para o cliente.")
                    }
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-3.5 font-semibold text-white transition-colors hover:bg-brand-navy/90"
                  >
                    <Navigation size={18} />
                    Ir até o cliente (GPS)
                    <ExternalLink size={14} className="opacity-70" />
                  </button>
                  <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
                    <AlertTriangle
                      size={15}
                      className="mt-0.5 shrink-0 text-warning"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se o cliente está <strong>visitando você</strong>,
                      confirme abaixo. Esta ação fica registrada para auditoria.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationStatus("manual")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning py-3.5 text-sm font-semibold text-warning transition-colors hover:bg-warning-bg"
                  >
                    <MapPin size={16} />
                    Estou recebendo o cliente no meu endereço
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OUTCOME STEP */}
          {step === "outcome" && (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Qual foi o resultado do contato?
              </p>
              <div className="flex flex-col gap-2">
                {PREV_OUTCOMES.map((o) => {
                  const colors = outcomeColors[o.color];
                  const selected = outcome === o.value;
                  return (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setOutcome(o.value)}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
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
                        {o.icon}
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
                        <CheckCircle2 size={16} className={colors.icon} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
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
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-2">
          {step === "channel" && (
            <Button
              className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
              disabled={!channel}
              onClick={() => setStep("channel_action")}
            >
              Continuar <ChevronRight size={16} />
            </Button>
          )}

          {step === "channel_action" && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-5"
                onClick={() => setStep("channel")}
              >
                Voltar
              </Button>
              <Button
                className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
                disabled={channel === "visit" && !locationOk}
                onClick={() => setStep("outcome")}
              >
                {channel === "visit" && !locationOk ? (
                  <>
                    <MapPinOff size={15} />
                    Confirme a localização
                  </>
                ) : (
                  <>
                    Registrar resultado <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </>
          )}

          {step === "outcome" && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-5"
                onClick={() => setStep("channel_action")}
              >
                Voltar
              </Button>
              <Button
                className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
                disabled={saving || !canSaveOutcome}
                onClick={handleSave}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Salvando…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Registrar
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
