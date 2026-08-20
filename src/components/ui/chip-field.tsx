import type { ReactNode } from "react";
import { ChipButton } from "@/components/ui/chip-button";
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import type { SelectOption } from "@/components/ui/select-option";
import { cn } from "@/lib/utils";

interface ChipFieldBase {
  name?: string;
  label: string;
  options: SelectOption[];
  description?: string;
  chipsClassName?: string;
  className?: string;
  required?: boolean;
  error?: string;
  children?: ReactNode;
}

interface ChipFieldSingleProps extends ChipFieldBase {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

interface ChipFieldMultipleProps extends ChipFieldBase {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type ChipFieldProps = ChipFieldSingleProps | ChipFieldMultipleProps;

function toggleOption(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((entry) => entry !== item)
    : [...list, item];
}

export function ChipField(props: ChipFieldProps) {
  const {
    name,
    label,
    options,
    description,
    chipsClassName,
    className,
    required,
    error,
    children,
  } = props;

  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...fieldAnchorProps(name, error)}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      {description ? (
        <p className="text-xs text-[#9DA3B4]">{description}</p>
      ) : null}
      <div className={cn("flex min-w-0 flex-wrap gap-2", chipsClassName)}>
        {options.map((option) => {
          const active = props.multiple
            ? props.value.includes(option.value)
            : props.value === option.value;

          return (
            <ChipButton
              key={option.value}
              active={active}
              onClick={() => {
                if (props.multiple) {
                  props.onChange(toggleOption(props.value, option.value));
                  return;
                }
                props.onChange(option.value);
              }}
            >
              {option.label}
            </ChipButton>
          );
        })}
      </div>
      <FieldErrorMessage error={error} />
      {children}
    </div>
  );
}
