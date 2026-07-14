import { MapPin, MessageSquare } from "lucide-react";

interface TaskTypeBadgeProps {
  isVisit: boolean;
}

export function TaskTypeBadge({ isVisit }: TaskTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        isVisit ? "bg-[#E6F7F1] text-[#0F6E56]" : "bg-brand-navy text-white"
      }`}
    >
      {isVisit ? <MapPin size={10} /> : <MessageSquare size={10} />}
      {isVisit ? "Visita" : "Contato"}
    </span>
  );
}
