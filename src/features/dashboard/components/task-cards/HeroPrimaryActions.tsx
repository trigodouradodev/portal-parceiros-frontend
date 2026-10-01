import { MapPin, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappButtonClassName } from "@/components/ui/whatsapp-button";
import { PostponeControl } from "@/features/dashboard/components/task-cards/PostponeControl";

interface HeroPrimaryActionsProps {
  isVisitTask: boolean;
  canPostpone: boolean;
  onVisit: () => void;
  onWhatsApp: () => void;
  onCall: () => void;
  onPostponeClick: () => void;
}

export function HeroPrimaryActions({
  isVisitTask,
  canPostpone,
  onVisit,
  onWhatsApp,
  onCall,
  onPostponeClick,
}: HeroPrimaryActionsProps) {
  if (isVisitTask) {
    return (
      <Button
        type="button"
        size="sm"
        className="h-9 flex-1 gap-1.5 bg-brand-navy text-xs text-white hover:bg-brand-navy/90"
        onClick={onVisit}
      >
        <MapPin size={11} />
        Registrar Visita
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        className={`h-9 flex-1 gap-1.5 text-xs ${whatsappButtonClassName}`}
        onClick={onWhatsApp}
      >
        <MessageSquare size={11} />
        WhatsApp
      </Button>
      <Button
        type="button"
        size="sm"
        className="h-9 flex-1 gap-1.5 bg-brand-navy text-xs text-white hover:bg-brand-navy/90"
        onClick={onCall}
      >
        <Phone size={11} />
        Ligar
      </Button>
      <PostponeControl
        canPostpone={canPostpone}
        onPostponeClick={onPostponeClick}
        buttonClassName="h-9 gap-1 border-[#E2E4EC] px-3 text-xs text-[#6B7080] hover:border-[#F5C37A] hover:text-[#854F0B]"
      />
    </>
  );
}
