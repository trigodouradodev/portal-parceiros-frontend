import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelectOption } from "@/components/ui/select-option";
import {
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import {
  fieldControlClassName,
  fieldIconClassName,
} from "@/components/ui/field-control";
import { cn } from "@/lib/utils";

/** A partir desse total de opções, o Dialog ganha um campo de busca. */
const SEARCH_THRESHOLD = 8;

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

interface SelectDialogFieldProps {
  name?: string;
  label?: string;
  dialogTitle?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  selectedLabelClassName?: string;
  required?: boolean;
  error?: string;
  hint?: string;
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
 *
 * Listas com mais de `SEARCH_THRESHOLD` opções ganham automaticamente um
 * campo de busca no topo do Dialog, que filtra por label (sem diferenciar
 * maiúsculas/acentos). Listas curtas continuam sem esse campo extra.
 */
export function SelectDialogField({
  name,
  label,
  dialogTitle,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className,
  selectedLabelClassName,
  required,
  error,
  hint,
  disabled,
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: SelectDialogFieldProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const selected = options.find((option) => option.value === value);
  const title = dialogTitle ?? label ?? placeholder;
  const showSearch = options.length > SEARCH_THRESHOLD;

  const filteredOptions = useMemo(() => {
    if (!showSearch || search.trim() === "") return options;
    const query = normalizeForSearch(search);
    return options.filter((option) =>
      normalizeForSearch(option.label).includes(query),
    );
  }, [options, search, showSearch]);

  function handleOpenChange(next: boolean) {
    if (disabled && next) return;
    if (!isControlled) setUncontrolledOpen(next);
    if (!next) setSearch("");
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
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {showSearch ? (
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              autoFocus
              className="pl-9"
            />
          </div>
        ) : null}
        <div className="-mx-1 flex max-h-[60vh] flex-col gap-1 overflow-y-auto px-1">
          {filteredOptions.map((option) => {
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
          {showSearch && filteredOptions.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (hideTrigger) return dialog;

  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
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
        className={fieldControlClassName({ error: Boolean(error), disabled })}
      >
        <span
          className={cn(
            "flex-1 truncate text-sm",
            selectedLabelClassName,
            disabled
              ? "text-muted-foreground"
              : selected
                ? "text-foreground"
                : "text-muted-foreground/70",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={16} className={fieldIconClassName} />
      </button>
      <FieldErrorMessage error={error} />
      {hint && !error ? <FieldHint>{hint}</FieldHint> : null}
      {dialog}
    </div>
  );
}
