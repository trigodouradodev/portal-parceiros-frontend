import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import { addDays } from "date-fns";
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
import {
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { FormField } from "@/components/ui/form";
import {
  FIRST_INSTALLMENT_MAX_DAYS,
  isAllowedDueDate,
} from "@/features/originacao/data/simulacao";
import type { SimulationFormValues } from "@/features/originacao/schemas/simulation-form";

interface SimulationDueDateFieldProps {
  today: Date;
}

export function SimulationDueDateField({ today }: SimulationDueDateFieldProps) {
  const { control, setValue, watch } = useFormContext<SimulationFormValues>();
  const dueDate = watch("dueDate");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState<Date | undefined>(undefined);
  const dueDateLimit = addDays(today, FIRST_INSTALLMENT_MAX_DAYS);

  function openDialog() {
    setDraftDueDate(dueDate);
    setDialogOpen(true);
  }

  function confirmDueDate() {
    if (!draftDueDate) return;
    setValue("dueDate", draftDueDate, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setDialogOpen(false);
  }

  return (
    <>
      <FormField
        control={control}
        name="dueDate"
        render={({ fieldState }) => (
          <div
            className="flex flex-col gap-1.5"
            {...fieldAnchorProps("dueDate", fieldState.error?.message)}
          >
            <FieldLabel required>Melhor dia de vencimento</FieldLabel>
            <FieldHint>
              Vencimento sempre no dia 5, 10, 15 ou 20, dentro de uma janela de
              até {FIRST_INSTALLMENT_MAX_DAYS} dias (D+
              {FIRST_INSTALLMENT_MAX_DAYS}) a partir de hoje.
            </FieldHint>
            <button
              type="button"
              onClick={openDialog}
              className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-left transition-colors hover:bg-muted/80"
            >
              <CalendarDays
                size={16}
                className="shrink-0 text-muted-foreground"
              />
              <span
                className={
                  dueDate
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground/70"
                }
              >
                {dueDate
                  ? dueDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Selecionar data"}
              </span>
            </button>
            <FieldErrorMessage error={fieldState.error?.message} />
          </div>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Selecionar o dia de vencimento</DialogTitle>
            <DialogDescription>
              Sempre no dia 5, 10, 15 ou 20, dentro de uma janela de até{" "}
              {FIRST_INSTALLMENT_MAX_DAYS} dias a partir de hoje.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={draftDueDate}
              onSelect={setDraftDueDate}
              disabled={[
                { before: today },
                { after: dueDateLimit },
                (date) => !isAllowedDueDate(date),
              ]}
              className="rounded-lg border"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="pillSm"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="pillSm"
              disabled={!draftDueDate}
              onClick={confirmDueDate}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
