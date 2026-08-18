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
        "h-10 rounded-2xl border-2 px-3 text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed border-[#E2E4EC] bg-[#F5F6FA] text-[#B7BBC9]"
          : active
            ? "border-brand-navy bg-brand-navy/10 text-brand-navy"
            : "border-[#E2E4EC] text-[#1A1D2E] hover:bg-[#F5F6FA]",
        className,
      )}
    >
      {children}
    </button>
  );
}
