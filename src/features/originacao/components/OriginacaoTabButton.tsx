import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OriginacaoTabButtonProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  locked?: boolean;
  onClick: () => void;
}

export function OriginacaoTabButton({
  label,
  active,
  disabled,
  locked,
  onClick,
}: OriginacaoTabButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={
        disabled ? "Conclua uma simulação para liberar a proposta" : undefined
      }
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
        disabled
          ? "cursor-not-allowed text-[#C8CBD8]"
          : active
            ? "bg-white text-brand-navy shadow-sm"
            : "text-[#9DA3B4] hover:text-[#6B7080]",
      )}
    >
      {locked ? <Lock size={12} aria-hidden /> : null}
      {label}
    </button>
  );
}
