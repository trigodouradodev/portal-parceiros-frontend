import type { Control } from "react-hook-form";
import { FormInput } from "@/components/ui/rhf-fields";
import type { ProfileFormValues } from "@/features/profile/schemas/profile-form";

interface ProfileTextFieldProps {
  control: Control<ProfileFormValues>;
  name: keyof ProfileFormValues;
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  transform?: (value: string) => string;
  hint?: string;
}

export function ProfileTextField({
  name,
  label,
  icon,
  placeholder,
  type = "text",
  autoComplete,
  transform,
  hint,
}: ProfileTextFieldProps) {
  return (
    <FormInput<ProfileFormValues>
      name={name}
      label={label}
      icon={icon}
      placeholder={placeholder}
      type={type}
      autoComplete={autoComplete}
      transform={transform}
      hint={hint}
    />
  );
}
