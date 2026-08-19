import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, parseCalendarDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

interface DateFilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * AUREA-346: filtro de data reaproveitando o `Calendar` da marca (o mesmo
 * usado em PromiseDateModal/VisitRescheduleDialog/Simulação), em vez do
 * `<input type="date">` nativo do navegador — única tela que ainda usava o
 * seletor cru, destoando do resto do app.
 */
export function DateFilterField({
  label,
  value,
  onChange,
  className,
}: DateFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? (parseCalendarDate(value) ?? undefined) : undefined;
  const [draft, setDraft] = useState<Date | undefined>(selected);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(selected);
    setOpen(next);
  }

  function handleConfirm() {
    onChange(draft ? format(draft, "yyyy-MM-dd") : "");
    setOpen(false);
  }

  function handleClear() {
    onChange("");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label={label}
        className={cn(
          "flex h-9 items-center gap-2 rounded border border-input bg-white px-3 text-sm text-foreground outline-none transition-colors hover:border-brand-navy/40",
          !value && "text-muted-foreground/70",
          className,
        )}
      >
        <CalendarIcon size={14} className="shrink-0 text-muted-foreground" />
        {value ? formatDate(value) : "dd/mm/aaaa"}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={draft}
              onSelect={setDraft}
              className="rounded-lg border"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={handleClear}
            >
              Limpar
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-brand-navy font-semibold text-white"
              onClick={handleConfirm}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
