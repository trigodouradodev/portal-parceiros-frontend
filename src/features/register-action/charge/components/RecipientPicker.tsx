import { CheckCircle2 } from "lucide-react";
import { ActivityRecipientType } from "@/services/activities/activity.enums";
import { hasCallablePhone } from "@/lib/contact-actions";

interface RecipientPickerProps {
  value: ActivityRecipientType;
  onChange: (value: ActivityRecipientType) => void;
  clientName: string;
  clientPhone?: string;
}

interface RecipientOption {
  type: ActivityRecipientType;
  title: string;
  subtitle: string;
  detail?: string;
  disabled: boolean;
}

export function RecipientPicker({
  value,
  onChange,
  clientName,
  clientPhone,
}: RecipientPickerProps) {
  const formattedPhone =
    clientPhone && hasCallablePhone(clientPhone) ? clientPhone : undefined;

  const options: RecipientOption[] = [
    {
      type: ActivityRecipientType.CLIENT,
      title: "Cliente / Tomador",
      subtitle: clientName,
      detail: formattedPhone,
      disabled: false,
    },
    {
      type: ActivityRecipientType.GUARANTOR,
      title: "Avalista",
      subtitle: "Não cadastrado",
      disabled: true,
    },
    {
      type: ActivityRecipientType.OTHER,
      title: "Outros contatos",
      subtitle: "Nenhum contato enriquecido encontrado",
      disabled: true,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Para quem será direcionada esta ação?
      </p>
      {options.map((option) => {
        const selected = value === option.type;

        return (
          <button
            key={option.type}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.type)}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
              option.disabled
                ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                : selected
                  ? "border-brand-navy bg-brand-yellow/15"
                  : "border-border bg-white hover:border-input"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {option.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {option.subtitle}
              </p>
              {option.detail && (
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {option.detail}
                </p>
              )}
            </div>
            {selected && !option.disabled && (
              <CheckCircle2 size={18} className="shrink-0 text-brand-navy" />
            )}
          </button>
        );
      })}
    </div>
  );
}
