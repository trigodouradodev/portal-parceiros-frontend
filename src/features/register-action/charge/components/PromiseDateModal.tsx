import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROMISE_MAX_DAYS } from "@/services/activities/activity.enums";

interface PromiseDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftDate?: Date;
  onDraftDateChange: (date: Date) => void;
  onConfirm: () => void;
  minDate: Date;
  maxDate: Date;
}

export function PromiseDateModal({
  open,
  onOpenChange,
  draftDate,
  onDraftDateChange,
  onConfirm,
  minDate,
  maxDate,
}: PromiseDateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>Data prometida para pagamento</DialogTitle>
          <DialogDescription>
            Selecione até quando o cliente se comprometeu a pagar (prazo máximo
            de {PROMISE_MAX_DAYS} dias).
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Calendar
            selected={draftDate}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={onDraftDateChange}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="h-10 rounded-xl bg-brand-navy font-semibold text-white"
            disabled={!draftDate}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
