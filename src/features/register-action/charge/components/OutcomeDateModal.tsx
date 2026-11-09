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
import type { OutcomeDateKind } from "../utils/outcome-date";

interface OutcomeDateModalProps {
  kind: OutcomeDateKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftDate?: Date;
  onDraftDateChange: (date: Date | undefined) => void;
  onConfirm: () => void;
  minDate: Date;
  maxDate: Date;
}

export function OutcomeDateModal({
  kind,
  open,
  onOpenChange,
  draftDate,
  onDraftDateChange,
  onConfirm,
  minDate,
  maxDate,
}: OutcomeDateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>
            {kind === "agreement"
              ? "Data prevista para o acordo"
              : "Data prometida para pagamento"}
          </DialogTitle>
          <DialogDescription>
            {kind === "agreement"
              ? `Selecione a data prevista para fechar a negociação, entre amanhã e os próximos ${PROMISE_MAX_DAYS} dias.`
              : `Selecione até quando o cliente se comprometeu a pagar (prazo máximo de ${PROMISE_MAX_DAYS} dias).`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            defaultMonth={draftDate ?? minDate}
            selected={draftDate}
            onSelect={onDraftDateChange}
            disabled={{ before: minDate, after: maxDate }}
            className="rounded-lg border"
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
            disabled={!draftDate || draftDate < minDate || draftDate > maxDate}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
