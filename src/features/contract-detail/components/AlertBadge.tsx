import { AlertTriangle } from "lucide-react";
import type { AlertType } from "@/features/contract-detail/types";

interface AlertBadgeProps {
  type: AlertType;
  days: number;
}

export function AlertBadge({ type, days }: AlertBadgeProps) {
  const isOverdue = type === "overdue";

  const color = isOverdue
    ? days > 30
      ? "#D84040"
      : "#BA7517"
    : days === 0
      ? "#D84040"
      : days <= 2
        ? "#BA7517"
        : "#1D9E75";

  const bg = isOverdue
    ? days > 30
      ? "#FEF2F2"
      : "#FFFBEB"
    : days === 0
      ? "#FEF2F2"
      : days <= 2
        ? "#FFFBEB"
        : "#F0FDF4";

  const label = isOverdue
    ? `${days}d atraso`
    : days === 0
      ? "Vence hoje"
      : days === 1
        ? "Vence amanhã"
        : `Vence em ${days}d`;

  return (
    <span
      className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
      style={{ color, backgroundColor: bg }}
    >
      <AlertTriangle size={9} />
      {label}
    </span>
  );
}
