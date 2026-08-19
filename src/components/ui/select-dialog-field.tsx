import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { SelectOption } from "@/components/ui/select-option";
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { cn } from "@/lib/utils";

interface SelectDialogFieldProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

/**
 * Select no mesmo visual "pill" do InputField, mas que resolve a escolha num
 * Dialog (lista de opções) em vez do popover do Radix Select — o popover é
 * posicionado por cima do conteúdo sem nenhum overlay escurecendo o fundo, e
 * em telas estreitas acaba sobrepondo os campos abaixo dele de um jeito confuso.
 * O Dialog já resolve isso em qualquer largura de tela (mesmo padrão do
 * DateFilterField).
 */
export function SelectDialogField({
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className,
  required,
  error,
  disabled,
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: SelectDialogFieldProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const selected = options.find((option) => option.value === value);

  function handleOpenChange(next: boolean) {
    if (disabled && next) return;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function handleSelect(next: string) {
    onChange(next);
    handleOpenChange(false);
  }

  const dialog = (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>{label ?? placeholder}</DialogTitle>
        </DialogHeader>
        <div className="-mx-1 flex max-h-[60vh] flex-col gap-1 overflow-y-auto px-1">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                  isSelected
                    ? "bg-brand-yellow/20 font-semibold text-brand-navy"
                    : "text-foreground",
                )}
              >
                {option.label}
                {isSelected && <Check size={16} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (hideTrigger) return dialog;

  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      {...fieldAnchorProps(name, error)}
    >
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      {!label && required ? (
        <Label className="sr-only">Obrigatório</Label>
      ) : null}
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
        <span
          className={cn(
            "flex-1 truncate text-sm",
            disabled
              ? "text-[#6B7080]"
              : selected
                ? "text-[#1A1D2E]"
                : "text-[#C8CBD8]",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={16} className="shrink-0 text-[#9DA3B4]" />
      </button>
      <FieldErrorMessage error={error} />
      {dialog}
    </div>
  );
}
