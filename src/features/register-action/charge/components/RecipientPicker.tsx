import { CheckCircle2, User, UserPlus, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { ActionParty } from "@/contexts/action/action-context";
import { ActivityRecipientType } from "@/services/activities/activity.enums";
import { hasCallablePhone, hasValidAddress } from "@/lib/contact-actions";
import { cn } from "@/lib/utils";

interface RecipientPickerProps {
  value: ActivityRecipientType;
  onChange: (value: ActivityRecipientType) => void;
  clientName: string;
  clientPhone?: string;
  guarantor?: ActionParty | null;
  /** Quando true, avalista precisa de endereço (visita). */
  requireAddressForGuarantor?: boolean;
}

interface RecipientOption {
  type: ActivityRecipientType;
  title: string;
  subtitle: string;
  detail?: string;
  disabled: boolean;
  icon: ReactNode;
  iconClassName: string;
}

function getRecipientOptionClassName(
  disabled: boolean,
  selected: boolean,
): string {
  const base =
    "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all";

  if (disabled) {
    return `${base} cursor-not-allowed border-border bg-muted/40 opacity-60`;
  }

  if (selected) {
    return `${base} border-brand-navy bg-brand-yellow/15`;
  }

  return `${base} border-border bg-white hover:border-input`;
}

function buildRecipientOptions(
  clientName: string,
  clientPhone: string | undefined,
  guarantor: ActionParty | null | undefined,
  requireAddressForGuarantor: boolean,
): RecipientOption[] {
  const formattedPhone =
    clientPhone && hasCallablePhone(clientPhone) ? clientPhone : undefined;

  const hasGuarantor = Boolean(guarantor?.name);
  const guarantorPhoneOk = hasCallablePhone(guarantor?.phone);
  const guarantorAddressOk = hasValidAddress(guarantor?.address);
  const guarantorDisabled =
    !hasGuarantor ||
    (requireAddressForGuarantor
      ? !guarantorAddressOk
      : !guarantorPhoneOk && !guarantorAddressOk);

  let guarantorSubtitle = "Não cadastrado";
  let guarantorDetail: string | undefined;
  if (hasGuarantor && guarantor) {
    guarantorSubtitle = guarantor.name;
    if (guarantorPhoneOk && guarantor.phone) {
      guarantorDetail = guarantor.phone;
    } else if (requireAddressForGuarantor && !guarantorAddressOk) {
      guarantorDetail = "Endereço não cadastrado";
    } else if (!guarantorPhoneOk) {
      guarantorDetail = "Telefone não cadastrado";
    }
  }

  return [
    {
      type: ActivityRecipientType.CLIENT,
      title: "Cliente / Tomador",
      subtitle: clientName,
      detail: formattedPhone,
      disabled: false,
      icon: <User size={18} />,
      iconClassName: "bg-[#E8EEF9] text-[#3B6FBF]",
    },
    {
      type: ActivityRecipientType.GUARANTOR,
      title: "Avalista",
      subtitle: guarantorSubtitle,
      detail: guarantorDetail,
      disabled: guarantorDisabled,
      icon: <Users size={18} />,
      iconClassName: "bg-[#FDF3E0] text-[#BA7517]",
    },
    {
      type: ActivityRecipientType.OTHER,
      title: "Outros contatos",
      subtitle: "Nenhum contato enriquecido encontrado",
      disabled: true,
      icon: <UserPlus size={18} />,
      iconClassName: "bg-muted text-muted-foreground",
    },
  ];
}

interface RecipientOptionCardProps {
  option: RecipientOption;
  selected: boolean;
  onSelect: (type: ActivityRecipientType) => void;
}

function RecipientOptionCard({
  option,
  selected,
  onSelect,
}: RecipientOptionCardProps) {
  return (
    <button
      type="button"
      disabled={option.disabled}
      onClick={() => onSelect(option.type)}
      className={getRecipientOptionClassName(option.disabled, selected)}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          option.iconClassName,
        )}
      >
        {option.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{option.title}</p>
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
}

export function RecipientPicker({
  value,
  onChange,
  clientName,
  clientPhone,
  guarantor,
  requireAddressForGuarantor = false,
}: RecipientPickerProps) {
  const options = buildRecipientOptions(
    clientName,
    clientPhone,
    guarantor,
    requireAddressForGuarantor,
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Para quem será direcionada esta ação?
      </p>
      {options.map((option) => (
        <RecipientOptionCard
          key={option.type}
          option={option}
          selected={value === option.type}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}
