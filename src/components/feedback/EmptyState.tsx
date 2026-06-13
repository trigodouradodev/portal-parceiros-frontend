import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  label: string;
  className?: string;
}

export function EmptyState({ label, className }: EmptyStateProps) {
  return (
    <div className={cn("py-12 text-center text-muted-foreground", className)}>
      <CheckCircle2 size={32} className="mx-auto mb-2 text-success" />
      <p className="font-medium text-foreground">Tudo em dia!</p>
      <p className="mt-1 text-sm text-muted-foreground/80">{label}</p>
    </div>
  );
}
