import { useState } from "react";
import { format } from "date-fns";
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
import { formatDate, parseCalendarDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

interface DateFilterFieldProps {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  minDate?: string;
  maxDate?: string;
  dialogTitle: string;
  dialogDescription: string;
}

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function DateFilterField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  dialogTitle,
  dialogDescription,
}: DateFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | undefined>();

  const selected = value ? (parseCalendarDate(value) ?? undefined) : undefined;
  const min = minDate ? (parseCalendarDate(minDate) ?? undefined) : undefined;
  const max = maxDate ? (parseCalendarDate(maxDate) ?? undefined) : undefined;

  function openDialog() {
    setDraft(selected);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  function confirm() {
    if (!draft) return;
    onChange(toIsoDate(draft));
    closeDialog();
  }

  function clear() {
    setDraft(undefined);
    if (value) onChange("");
    closeDialog();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={dialogTitle}
        className="flex h-9 w-full min-w-0 items-center gap-2 rounded border border-input bg-white px-3 py-2 text-left text-sm outline-none transition-colors hover:border-brand-navy/40 focus-visible:border-brand-navy md:w-40"
      >
        <CalendarDays size={16} className="shrink-0 text-[#6B7080]" />
        <span
          className={cn(
            "truncate",
            value ? "font-medium text-[#1A1D2E]" : "text-[#9DA3B4]",
          )}
        >
          {value ? formatDate(value) : label}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              selected={draft}
              minDate={min}
              maxDate={max}
              onSelect={setDraft}
            />
          </div>
          <DialogFooter className="justify-between">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl"
              disabled={!value && !draft}
              onClick={clear}
            >
              Limpar
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-brand-navy font-semibold text-white"
              disabled={!draft}
              onClick={confirm}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
