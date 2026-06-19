import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Phone,
} from "lucide-react";
import type { WaTemplate } from "@/features/register-action/charge/utils/cobr-wa-templates";
import {
  hasCallablePhone,
  openPhoneCall,
  openWhatsApp,
} from "@/lib/contact-actions";

interface ContactActionsBarProps {
  phone: string;
  clientFirstName: string;
  templates: WaTemplate[];
}

export function ContactActionsBar({
  phone,
  clientFirstName,
  templates,
}: ContactActionsBarProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const callable = hasCallablePhone(phone);

  function handleCopy(index: number) {
    navigator.clipboard?.writeText(templates[index].message).catch(() => {});
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex items-center gap-4 rounded-2xl bg-background p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
          <Phone size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs text-muted-foreground">
            Telefone cadastrado
          </p>
          <p className="truncate font-mono-dm text-base font-bold text-foreground">
            {callable ? phone : "Telefone não disponível"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!callable}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => openPhoneCall(phone)}
        >
          <Phone size={16} />
          Ligar
          <ExternalLink size={12} className="opacity-70" />
        </button>
        <button
          type="button"
          disabled={!callable}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5a] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() =>
            openWhatsApp(phone, templates[selectedIndex]?.message)
          }
        >
          <MessageSquare size={16} />
          WhatsApp
          <ExternalLink size={12} className="opacity-70" />
        </button>
      </div>

      {callable && templates.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Mensagem para {clientFirstName}:
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template, index) => (
              <button
                key={template.tag}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedIndex === index
                    ? "bg-brand-navy text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {template.tag}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleCopy(selectedIndex)}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-brand-navy"
            >
              {copiedIndex === selectedIndex ? (
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
          <p className="text-sm leading-relaxed text-muted-foreground">
            {templates[selectedIndex]?.message}
          </p>
        </div>
      )}
    </div>
  );
}
