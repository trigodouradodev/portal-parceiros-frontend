import { useEffect, useState } from "react";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
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

interface PaymentForecastFieldProps {
  value?: Date;
  onChange: (date: Date) => void;
  invalid?: boolean;
}

export function PaymentForecastField({
  value,
  onChange,
  invalid = false,
}: PaymentForecastFieldProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(value);
  const today = startOfDay(new Date());

  useEffect(() => {
    if (open) setDraftDate(value);
  }, [open, value]);

  return (
    <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-semibold text-foreground">
        Nova previsão de pagamento <span className="text-destructive">*</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Informe a data solicitada pelo destinatário.
      </p>
      <Button
        type="button"
        variant="outline"
        className={`mt-3 h-11 w-full justify-start gap-2 rounded-xl ${
          invalid ? "border-2 border-destructive" : ""
        }`}
        onClick={() => setOpen(true)}
      >
        <CalendarDays size={16} />
        {value
          ? format(value, "dd/MM/yyyy", { locale: ptBR })
          : "Selecionar data"}
      </Button>
      {invalid && (
        <p className="mt-2 text-sm text-destructive">
          Informe a nova previsão de pagamento para continuar.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Nova previsão de pagamento</DialogTitle>
            <DialogDescription>
              Selecione a data solicitada para o pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={draftDate}
              onSelect={setDraftDate}
              disabled={{ before: today }}
              className="rounded-lg border"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-brand-navy font-semibold text-white"
              disabled={!draftDate}
              onClick={() => {
                if (!draftDate) return;
                onChange(draftDate);
                setOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
