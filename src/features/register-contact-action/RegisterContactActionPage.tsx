import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionContext } from "@/contexts/action";

export function RegisterContactActionPage() {
  const navigate = useNavigate();
  const { client, contactType, onComplete, clearActionData } =
    useActionContext();
  const [contactDate, setContactDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [contactTime, setContactTime] = useState(() =>
    new Date().toTimeString().slice(0, 5),
  );
  const [contactStatus, setContactStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client || !contactType) {
      navigate(-1);
    }
  }, [client, contactType, navigate]);

  if (!client || !contactType) {
    return null;
  }

  const isPhone = contactType === "phone";
  const title = isPhone ? "Registrar Ligação" : "Registrar Visita";

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onComplete({
        channel: isPhone ? "phone" : "visit",
        outcome: contactStatus || "completed",
        note,
        status: contactStatus || "Contato realizado",
      });
      clearActionData();
      navigate(-1);
    }, 900);
  }

  const statusOptions = isPhone
    ? [
        "Sem retorno",
        "Sem Previsão",
        "Promessa de pagamento",
        "Disputa / Contestação",
        "Renegociação",
        "Outro",
      ]
    : [
        "Não localizado",
        "Sem Previsão",
        "Promessa de pagamento",
        "Renegociação",
        "Outro",
      ];

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

        {/* Form content */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={contactDate}
                  onChange={(e) => setContactDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={contactTime}
                  onChange={(e) => setContactTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Status / Resultado</Label>
              <Select onValueChange={setContactStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder={`Descreva como foi a ${isPhone ? "ligação" : "visita"}…`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 min-h-[76px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="h-12 rounded-2xl px-5"
            onClick={() => {
              clearActionData();
              navigate(-1);
            }}
          >
            Cancelar
          </Button>
          <Button
            className="h-12 flex-1 gap-2 rounded-2xl bg-brand-navy font-semibold text-white"
            disabled={saving}
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
        </div>
      </div>
    </div>
  );
}
