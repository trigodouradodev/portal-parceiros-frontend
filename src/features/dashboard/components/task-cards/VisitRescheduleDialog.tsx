import { format } from "date-fns";
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
import { VISIT_RESCHEDULE_WINDOW_DAYS } from "@/features/dashboard/constants/visit-reschedule";

interface VisitRescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftDate: Date | undefined;
  onDraftDateChange: (date: Date | undefined) => void;
  minDate: Date;
  maxDate: Date;
  isRescheduling?: boolean;
  onConfirm: (isoDate: string) => void | Promise<void>;
}

export function VisitRescheduleDialog({
  open,
  onOpenChange,
  draftDate,
  onDraftDateChange,
  minDate,
  maxDate,
  isRescheduling = false,
  onConfirm,
}: VisitRescheduleDialogProps) {
  let confirmLabel = "Confirmar";
  if (isRescheduling) {
    confirmLabel = "Salvando...";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>Alterar data da visita</DialogTitle>
          <DialogDescription>
            Escolha uma nova data para a visita, dentro de uma janela de até{" "}
            {VISIT_RESCHEDULE_WINDOW_DAYS} dias. Essa alteração só pode ser
            feita uma vez.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={draftDate}
            onSelect={onDraftDateChange}
            disabled={{ before: minDate, after: maxDate }}
            className="rounded-lg border"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isRescheduling}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl bg-brand-navy font-semibold text-white"
            disabled={!draftDate || isRescheduling}
            onClick={() => {
              if (!draftDate) return;
              onConfirm(format(draftDate, "yyyy-MM-dd"));
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
