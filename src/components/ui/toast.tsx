import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastVariant } from "@/contexts/toast/toast-context";

interface ToastProps {
  children: React.ReactNode;
  variant?: ToastVariant;
  className?: string;
}

const variantStyles: Record<ToastVariant, string> = {
  info: "bg-[#1A1D2E] text-white",
  destructive: "bg-[#1A1D2E] text-white",
};

export function Toast({
  children,
  variant = "info",
  className,
}: ToastProps) {
  const Icon = variant === "destructive" ? AlertCircle : CheckCircle2;

  return (
    <div
      role="status"
      className={cn(
        "animate-toast-in flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg",
        variantStyles[variant],
        className,
      )}
    >
      <Icon
        size={14}
        className={
          variant === "destructive" ? "text-[#FCA5A5]" : "text-[#6EE7B7]"
        }
      />
      {children}
    </div>
  );
}
