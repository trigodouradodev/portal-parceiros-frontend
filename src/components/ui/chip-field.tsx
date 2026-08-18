import type { ReactNode } from "react";
import { ChipButton } from "@/components/ui/chip-button";
import { Label } from "@/components/ui/label";
import type { SelectOption } from "@/components/ui/select-option";
import { cn } from "@/lib/utils";

interface ChipFieldBase {
  label: string;
  options: SelectOption[];
  description?: string;
  chipsClassName?: string;
  className?: string;
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
  const { label, options, description, chipsClassName, className, children } =
    props;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
      {description ? (
        <p className="text-xs text-[#9DA3B4]">{description}</p>
      ) : null}
      <div className={cn("flex flex-wrap gap-2", chipsClassName)}>
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
      {children}
    </div>
  );
}
