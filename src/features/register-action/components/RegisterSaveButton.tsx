import type { ReactNode } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegisterSaveButtonProps {
  saving: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  savingLabel?: string;
  icon?: ReactNode;
  variant?: "navy" | "success";
  className?: string;
}

export function RegisterSaveButton({
  saving,
  disabled = false,
  onClick,
  label = "Registrar",
  savingLabel = "Salvando…",
  icon = <CheckCircle2 size={15} />,
  variant = "navy",
  className = "h-12 flex-1 gap-2 rounded-2xl font-semibold text-white",
}: RegisterSaveButtonProps) {
  const variantClass =
    variant === "success"
      ? "bg-success hover:bg-success/90"
      : "bg-brand-navy hover:bg-brand-navy/90";

  return (
    <Button
      className={`${className} ${variantClass}`}
      disabled={disabled || saving}
      onClick={onClick}
    >
      {saving ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          {savingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
}
