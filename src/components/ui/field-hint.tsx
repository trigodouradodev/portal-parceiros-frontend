/* eslint-disable react-refresh/only-export-components */
import type { HTMLAttributes, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

export function fieldElementId(name?: string) {
  return name ? `field-${name}` : undefined;
}

export function fieldAnchorProps(
  name?: string,
  error?: string,
): Pick<HTMLAttributes<HTMLDivElement>, "id" | "aria-invalid"> {
  return {
    id: fieldElementId(name),
    "aria-invalid": error ? true : undefined,
  };
}

export function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Label className="text-sm font-medium text-[#1A1D2E]">
      {children}
      {required ? (
        <span className="ml-0.5 text-[#D84040]" aria-hidden>
          *
        </span>
      ) : null}
    </Label>
  );
}

export function FieldErrorMessage({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
      <AlertCircle size={12} />
      {error}
    </div>
  );
}
