import { ChipButton } from "@/components/ui/chip-button";
import {
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";

interface YesNoFieldProps {
  name?: string;
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function YesNoField({
  name,
  label,
  value,
  onChange,
  required,
  error,
  hint,
}: YesNoFieldProps) {
  return (
    <div className="flex flex-col gap-1.5" {...fieldAnchorProps(name, error)}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex gap-2">
        <ChipButton active={value === true} onClick={() => onChange(true)}>
          Sim
        </ChipButton>
        <ChipButton active={value === false} onClick={() => onChange(false)}>
          Não
        </ChipButton>
      </div>
      <FieldErrorMessage error={error} />
      {hint && !error ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
