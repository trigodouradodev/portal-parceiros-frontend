import type { ReactNode } from "react";

interface OriginacaoEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function OriginacaoEmptyState({
  icon,
  title,
  description,
  action,
}: OriginacaoEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="mb-1 font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
