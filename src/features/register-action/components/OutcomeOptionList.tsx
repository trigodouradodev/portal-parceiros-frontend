import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import type { OutcomeColorKey } from "@/features/register-action/constants/outcome-colors";
import {
  OUTCOME_COLOR_CLASSES,
  type OutcomeColorClasses,
} from "@/features/register-action/constants/outcome-colors";
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
    required?: boolean;
    hint?: string;
    invalid?: boolean;
  };
  afterOptions?: ReactNode;
  compact?: boolean;
}

function getOptionButtonClassName(
  selected: boolean,
  colors: OutcomeColorClasses,
  compact: boolean,
): string {
  const padding = compact ? "p-3.5" : "p-4";
  const base = `flex items-center gap-3 rounded-2xl border-2 text-left transition-all ${padding}`;

  if (selected) {
    return `${base} ${colors.bg} ${colors.border}`;
  }

  return `${base} border-border bg-white hover:border-input hover:bg-background`;
}

function getOptionIconWrapperClassName(
  selected: boolean,
  colors: OutcomeColorClasses,
): string {
  const base = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl";

  if (selected) {
    return `${base} ${colors.bg} ${colors.icon}`;
  }

  return `${base} bg-muted text-muted-foreground`;
}

function getOptionLabelClassName(
  selected: boolean,
  colors: OutcomeColorClasses,
): string {
  if (selected) return `text-sm font-semibold ${colors.icon}`;
  return "text-sm font-semibold text-foreground";
}

interface OutcomeOptionCardProps {
  option: OutcomeOption;
  selected: boolean;
  compact: boolean;
  onSelect: (value: string) => void;
}

function OutcomeOptionCard({
  option,
  selected,
  compact,
  onSelect,
}: OutcomeOptionCardProps) {
  const colors = OUTCOME_COLOR_CLASSES[option.color];

  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={getOptionButtonClassName(selected, colors, compact)}
    >
      <div className={getOptionIconWrapperClassName(selected, colors)}>
        {option.icon ?? <CheckCircle2 size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={getOptionLabelClassName(selected, colors)}>
          {option.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
      </div>
      {selected && (
        <CheckCircle2 size={compact ? 16 : 18} className={colors.icon} />
      )}
    </button>
  );
}

export function OutcomeOptionList({
  options,
  value,
  onChange,
  prompt,
  note,
  afterOptions,
  compact = false,
}: OutcomeOptionListProps) {
  return (
    <div>
      {prompt && <p className="mb-3 text-sm text-muted-foreground">{prompt}</p>}
      <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
        {options.map((option) => (
          <OutcomeOptionCard
            key={option.value}
            option={option}
            selected={value === option.value}
            compact={compact}
            onSelect={onChange}
          />
        ))}
      </div>
      {afterOptions}
      {note && (
        <OptionalNoteField
          value={note.value}
          onChange={note.onChange}
          placeholder={note.placeholder}
          required={note.required}
          hint={note.hint}
          invalid={note.invalid}
          wrapperClassName={compact ? "mt-4" : "mt-2"}
        />
      )}
    </div>
  );
}
