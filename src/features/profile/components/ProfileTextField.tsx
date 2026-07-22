import { AlertCircle } from "lucide-react";
import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import type { ProfileFormValues } from "@/features/profile/schemas/profile-form";
import { cn } from "@/lib/utils";

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
  control,
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
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleChange = (
          event: React.ChangeEvent<HTMLInputElement>,
        ) => {
          const next = transform
            ? transform(event.target.value)
            : event.target.value;
          field.onChange(next);
        };

        return (
          <FormItem className="flex flex-col gap-1.5 space-y-0">
            <FormLabel className="text-sm font-medium text-[#1A1D2E]">
              {label}
            </FormLabel>
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 bg-[#F5F6FA] px-4 py-3 transition-colors",
                fieldState.error
                  ? "border-[#D84040]"
                  : "border-transparent focus-within:border-brand-navy",
              )}
            >
              <span className="shrink-0 text-[#9DA3B4]">{icon}</span>
              <FormControl>
                <input
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className="flex-1 bg-transparent text-sm text-[#1A1D2E] outline-none placeholder:text-[#C8CBD8]"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={handleChange}
                />
              </FormControl>
            </div>
            {fieldState.error?.message && (
              <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
                <AlertCircle size={12} />
                {fieldState.error.message}
              </div>
            )}
            {hint && !fieldState.error && (
              <p className="text-xs text-[#9DA3B4]">{hint}</p>
            )}
          </FormItem>
        );
      }}
    />
  );
}
