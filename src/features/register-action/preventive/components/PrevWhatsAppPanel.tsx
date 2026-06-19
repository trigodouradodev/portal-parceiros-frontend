import { CheckCircle2, Copy, ExternalLink, MessageSquare } from "lucide-react";
import type { WaTemplate } from "@/features/register-action/preventive/utils/prev-wa-templates";
import {
  hasCallablePhone,
  openWhatsApp,
} from "@/lib/contact-actions";

interface PrevWhatsAppPanelProps {
  phone: string;
  templates: WaTemplate[];
  selectedIndex: number;
  copiedIndex: number | null;
  onSelect: (index: number) => void;
  onCopy: (index: number) => void;
}

export function PrevWhatsAppPanel({
  phone,
  templates,
  selectedIndex,
  copiedIndex,
  onSelect,
  onCopy,
}: PrevWhatsAppPanelProps) {
  const callable = hasCallablePhone(phone);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Selecione uma mensagem e envie pelo WhatsApp.
      </p>
      {!callable && (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Telefone não disponível. Não é possível abrir o WhatsApp.
        </p>
      )}
      {templates.map((template, index) => (
        <div
          key={template.tag}
          onClick={() => onSelect(index)}
          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
            selectedIndex === index
              ? "border-brand-navy bg-brand-yellow/10"
              : "border-border bg-white hover:border-input"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                selectedIndex === index
                  ? "bg-brand-navy text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {template.tag}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopy(index);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-brand-navy"
            >
              {copiedIndex === index ? (
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
            {template.message}
          </p>
        </div>
      ))}
      <button
        type="button"
        disabled={!callable}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#1ebe5a] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() =>
          openWhatsApp(phone, templates[selectedIndex]?.message)
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
  );
}
