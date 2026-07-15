import { MapPin, MessageSquare } from "lucide-react";

interface TaskTypeBadgeProps {
  isVisit: boolean;
}

export function TaskTypeBadge({ isVisit }: TaskTypeBadgeProps) {
  let className =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-brand-navy text-white";
  let Icon = MessageSquare;
  let label = "Contato";

  if (isVisit) {
    className =
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-[#E6F7F1] text-[#0F6E56]";
    Icon = MapPin;
    label = "Visita";
  }

  return (
    <span className={className}>
      <Icon size={10} />
      {label}
    </span>
  );
}
