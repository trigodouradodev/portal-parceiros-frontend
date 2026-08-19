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
import { Label } from "@/components/ui/label";
import { formatDate, parseCalendarDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

interface DateFilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Campo de data no mesmo estilo "pill" do InputField/SelectDialogField
 * (Perfil, Originação), reaproveitando o `Calendar` da marca (o mesmo usado
 * em PromiseDateModal/VisitRescheduleDialog) em vez do `<input type="date">`
 * nativo do navegador. Introduzido na AUREA-346 (filtros da Carteira).
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-[#F5F6FA] px-4 py-3 text-left transition-colors focus-within:border-brand-navy"
      >
        <CalendarIcon size={16} className="shrink-0 text-[#9DA3B4]" />
        <span
          className={cn(
            "flex-1 text-sm",
            value ? "text-[#1A1D2E]" : "text-[#C8CBD8]",
          )}
        >
          {value ? formatDate(value) : "dd/mm/aaaa"}
        </span>
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
    </div>
  );
}
