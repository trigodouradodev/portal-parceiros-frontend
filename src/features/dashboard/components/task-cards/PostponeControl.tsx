import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostponeControlProps {
  canPostpone: boolean;
  onPostponeClick: () => void;
  buttonClassName?: string;
}

export function PostponeControl({
  canPostpone,
  onPostponeClick,
  buttonClassName = "h-10 gap-1 px-3 text-xs text-muted-foreground hover:border-[#F5C37A] hover:text-[#854F0B]",
}: PostponeControlProps) {
  if (canPostpone) {
    return (
      <Button
        type="button"
        variant="outline"
        className={buttonClassName}
        onClick={onPostponeClick}
        title="Postergar para amanhã (apenas 1 vez)"
      >
        <CalendarClock size={13} />
        Postergar · 1×
      </Button>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-[#FDF3E0] px-2 text-[10px] text-[#BA7517]">
      <CalendarClock size={11} /> Postergado
    </span>
  );
}
