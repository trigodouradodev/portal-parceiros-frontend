/* eslint-disable react-refresh/only-export-components */
import type { HTMLAttributes, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    <Label className="text-sm font-medium text-foreground">
      {children}
      {required ? (
        <span className="ml-0.5 text-destructive" aria-hidden>
          *
        </span>
      ) : null}
    </Label>
  );
}

export function FieldErrorMessage({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle size={12} />
      {error}
    </div>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export function FieldStatusMessage({
  tone,
  children,
}: {
  tone: "pending" | "success";
  children: ReactNode;
}) {
  const Icon = tone === "pending" ? Loader2 : CheckCircle2;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs",
        tone === "pending" ? "text-muted-foreground" : "text-success",
      )}
    >
      <Icon
        size={12}
        className={tone === "pending" ? "animate-spin" : undefined}
      />
      {children}
    </p>
  );
}
