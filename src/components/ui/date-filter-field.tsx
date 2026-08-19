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
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { formatDate, parseCalendarDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

interface DateFilterFieldProps {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  captionLayout?: "label" | "dropdown";
}

/**
 * Campo de data no mesmo estilo "pill" do InputField/SelectDialogField
 * (Perfil, Originação), reaproveitando o `Calendar` da marca (o mesmo usado
 * em PromiseDateModal/VisitRescheduleDialog) em vez do `<input type="date">`
 * nativo do navegador. Introduzido na AUREA-346 (filtros da Carteira).
 */
export function DateFilterField({
  name,
  label,
  value,
  onChange,
  className,
  required,
  error,
  disabled,
  min,
  max,
  captionLayout = "label",
}: DateFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? (parseCalendarDate(value) ?? undefined) : undefined;
  const [draft, setDraft] = useState<Date | undefined>(selected);
  const minDate = min ? (parseCalendarDate(min) ?? undefined) : undefined;
  const maxDate = max ? (parseCalendarDate(max) ?? undefined) : undefined;
  const endMonth = maxDate
    ? new Date(maxDate.getFullYear(), maxDate.getMonth())
    : undefined;
  const startMonth = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth())
    : captionLayout === "dropdown"
      ? new Date((maxDate ?? new Date()).getFullYear() - 120, 0)
      : undefined;

  function handleOpenChange(next: boolean) {
    if (disabled) return;
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
    <div
      className={cn("flex flex-col gap-1.5", className)}
      {...fieldAnchorProps(name, error)}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleOpenChange(true)}
        aria-invalid={error ? true : undefined}
        className={cn(
          "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
          disabled
            ? "cursor-not-allowed border-transparent bg-[#EFEFF3]"
            : error
              ? "border-[#D84040] bg-[#F5F6FA]"
              : "border-transparent bg-[#F5F6FA] focus-within:border-brand-navy",
        )}
      >
        <CalendarIcon size={16} className="shrink-0 text-[#9DA3B4]" />
        <span
          className={cn(
            "flex-1 text-sm",
            disabled
              ? "text-[#6B7080]"
              : value
                ? "text-[#1A1D2E]"
                : "text-[#C8CBD8]",
          )}
        >
          {value ? formatDate(value) : "dd/mm/aaaa"}
        </span>
      </button>
      <FieldErrorMessage error={error} />

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
              captionLayout={captionLayout}
              startMonth={startMonth}
              endMonth={endMonth}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
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
