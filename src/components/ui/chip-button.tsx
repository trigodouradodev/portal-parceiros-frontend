import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function ChipButton({
  active,
  onClick,
  children,
  className,
  disabled = false,
}: ChipButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "h-10 max-w-full rounded-2xl border-2 px-3 text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
          : active
            ? "border-brand-navy bg-brand-navy/10 text-brand-navy"
            : "border-border text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}
