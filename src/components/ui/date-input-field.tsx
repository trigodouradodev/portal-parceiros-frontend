import type { ComponentProps } from "react";
import { InputField } from "@/components/ui/input-field";

/** Masks numeric input without normalizing impossible dates. */
function maskDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter(Boolean)
    .join("/");
}

function displayDate(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : maskDate(value);
}

type DateInputFieldProps = Omit<
  ComponentProps<typeof InputField>,
  "type" | "inputMode" | "maxLength" | "max" | "placeholder" | "icon"
>;

/** Complete dates are stored as ISO; partial input stays visible for editing. */
export function DateInputField({
  value,
  onChange,
  ...props
}: DateInputFieldProps) {
  const handleChange = (value: string) => {
    const masked = maskDate(value);
    const complete = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(masked);
    onChange(
      complete ? `${complete[3]}-${complete[2]}-${complete[1]}` : masked,
    );
  };

  return (
    <InputField
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      value={displayDate(value)}
      onChange={handleChange}
    />
  );
}
