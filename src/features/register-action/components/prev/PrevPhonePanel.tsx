import { ExternalLink, Phone } from "lucide-react";

interface PrevPhonePanelProps {
  phone: string;
  clientFirstName: string;
}

export function PrevPhonePanel({ phone, clientFirstName }: PrevPhonePanelProps) {
  return (
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
            {phone}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-4 text-base font-semibold text-white transition-colors hover:bg-brand-navy/90"
        onClick={() => window.alert(`Iniciará ligação para ${phone}`)}
      >
        <Phone size={20} />
        Ligar agora para {clientFirstName}
        <ExternalLink size={14} className="opacity-70" />
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Após a ligação, avance para registrar o resultado.
      </p>
    </div>
  );
}
