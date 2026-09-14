import { cn } from "@/lib/utils";

export function fieldControlClassName({
  error,
  disabled,
  className,
}: {
  error?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    "flex min-w-0 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
    disabled
      ? "cursor-not-allowed border-transparent bg-muted"
      : error
        ? "border-destructive bg-muted"
        : "border-transparent bg-muted focus-within:border-brand-navy",
    className,
  );
}

export const fieldValueClassName =
  "min-w-0 w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:text-muted-foreground";

export const fieldIconClassName = "shrink-0 text-muted-foreground";
