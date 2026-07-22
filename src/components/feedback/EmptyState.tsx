import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  label: string;
  className?: string;
}

export function EmptyState({ label, className }: EmptyStateProps) {
  return (
    <div className={cn("py-12 text-center text-[#6B7080]", className)}>
      <CheckCircle2 size={32} className="mx-auto mb-2 text-[#1D9E75]" />
      <p className="font-medium text-[#1A1D2E]">Tudo em dia!</p>
      <p className="mt-1 text-sm text-[#9DA3B4]">{label}</p>
    </div>
  );
}
