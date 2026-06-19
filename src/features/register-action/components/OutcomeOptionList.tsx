import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import type { OutcomeColorKey } from "@/features/register-action/constants/outcome-colors";
import { OUTCOME_COLOR_CLASSES } from "@/features/register-action/constants/outcome-colors";
import { OptionalNoteField } from "./OptionalNoteField";

export interface OutcomeOption {
  value: string;
  label: string;
  desc: string;
  icon?: ReactNode;
  color: OutcomeColorKey;
}

interface OutcomeOptionListProps {
  options: OutcomeOption[];
  value: string | null;
  onChange: (value: string) => void;
  prompt?: string;
  note?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  compact?: boolean;
}

export function OutcomeOptionList({
  options,
  value,
  onChange,
  prompt,
  note,
  compact = false,
}: OutcomeOptionListProps) {
  return (
    <div>
      {prompt && (
        <p
          className={`text-sm text-muted-foreground ${compact ? "mb-3" : "mb-3"}`}
        >
          {prompt}
        </p>
      )}
      <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
        {options.map((option) => {
          const colors = OUTCOME_COLOR_CLASSES[option.color];
          const selected = value === option.value;

          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-3 rounded-2xl border-2 text-left transition-all ${
                compact ? "p-3.5" : "p-4"
              } ${
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
                {option.icon ?? <CheckCircle2 size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    selected ? colors.icon : "text-foreground"
                  }`}
                >
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.desc}
                </p>
              </div>
              {selected && (
                <CheckCircle2
                  size={compact ? 16 : 18}
                  className={colors.icon}
                />
              )}
            </button>
          );
        })}
      </div>
      {note && (
        <OptionalNoteField
          value={note.value}
          onChange={note.onChange}
          placeholder={note.placeholder}
          className={compact ? "mt-4" : "mt-2"}
        />
      )}
    </div>
  );
}
