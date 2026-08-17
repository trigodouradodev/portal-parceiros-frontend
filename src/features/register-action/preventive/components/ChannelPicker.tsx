import { CheckCircle2, MapPin, MessageSquare, Phone } from "lucide-react";

export type Channel = "whatsapp" | "phone" | "visit";

const CHANNEL_OPTIONS: {
  value: Channel;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
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
];

interface ChannelPickerProps {
  value: Channel | null;
  onChange: (channel: Channel) => void;
}

export function ChannelPicker({ value, onChange }: ChannelPickerProps) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Qual tipo de contato você vai realizar?
      </p>
      <div className="flex flex-col gap-2">
        {CHANNEL_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
              value === option.value
                ? "border-brand-navy bg-brand-yellow/10"
                : "border-border bg-white hover:border-input hover:bg-background"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                value === option.value
                  ? "bg-brand-navy text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {option.icon}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  value === option.value ? "text-brand-navy" : "text-foreground"
                }`}
              >
                {option.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {option.desc}
              </p>
            </div>
            {value === option.value && (
              <CheckCircle2 size={18} className="shrink-0 text-brand-navy" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
