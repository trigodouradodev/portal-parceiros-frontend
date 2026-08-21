import type { ReactNode } from "react";
import { CheckCircle2, User, Users } from "lucide-react";
import type { ActionParty } from "@/contexts/action";
import {
  FollowUpParty,
  type FollowUpParty as FollowUpPartyValue,
} from "@/services/followup/followup.types";

interface PreventiveRecipientPickerProps {
  value: FollowUpPartyValue | null;
  onChange: (party: FollowUpPartyValue) => void;
  clientName: string;
  guarantor?: ActionParty | null;
}

interface RecipientOption {
  value: FollowUpPartyValue;
  label: string;
  name: string;
  disabled: boolean;
  icon: ReactNode;
  iconClassName: string;
}

export function PreventiveRecipientPicker({
  value,
  onChange,
  clientName,
  guarantor,
}: PreventiveRecipientPickerProps) {
  const options: RecipientOption[] = [
    {
      value: FollowUpParty.CLIENT,
      label: "Cliente",
      name: clientName,
      disabled: false,
      icon: <User size={20} />,
      iconClassName: "bg-[#E8EEF9] text-[#3B6FBF]",
    },
    {
      value: FollowUpParty.GUARANTOR,
      label: "Avalista",
      name: guarantor?.name ?? "Não cadastrado",
      disabled: !guarantor?.name,
      icon: <Users size={20} />,
      iconClassName: "bg-[#FDF3E0] text-[#BA7517]",
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Para quem será direcionado este contato?
      </p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              type="button"
              key={option.value}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                option.disabled
                  ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                  : selected
                    ? "border-brand-navy bg-brand-yellow/10"
                    : "border-border bg-white hover:border-input hover:bg-background"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${option.iconClassName}`}
              >
                {option.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {option.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {option.name}
                </p>
              </div>
              {selected && !option.disabled && (
                <CheckCircle2 size={18} className="shrink-0 text-brand-navy" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
