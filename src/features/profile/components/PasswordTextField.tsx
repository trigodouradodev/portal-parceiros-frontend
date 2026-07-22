import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import type { PasswordFormValues } from "@/features/profile/schemas/profile-form";
import { cn } from "@/lib/utils";

interface PasswordTextFieldProps {
  control: Control<PasswordFormValues>;
  name: keyof PasswordFormValues;
  label: string;
  placeholder?: string;
  hint?: string;
}

export function PasswordTextField({
  control,
  name,
  label,
  placeholder,
  hint,
}: PasswordTextFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
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
            <span className="shrink-0 text-[#9DA3B4]">
              <Lock size={16} />
            </span>
            <FormControl>
              <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={
                  name === "currentPwd" ? "current-password" : "new-password"
                }
                className="flex-1 bg-transparent text-sm text-[#1A1D2E] outline-none placeholder:text-[#C8CBD8]"
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              className="shrink-0 text-[#9DA3B4] hover:text-[#6B7080]"
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
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
      )}
    />
  );
}
