import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { FieldErrorMessage, FieldLabel } from "@/components/ui/field-hint";
import {
  DECLINE_REASON_GROUPS,
  type DeclineReasonGroup,
} from "@/features/originacao/data/decline-reasons";
import { cn } from "@/lib/utils";

function normalizeForSearch(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

interface DeclineReasonPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * Lista de motivos de recusa: agrupada por assunto, com a explicação de cada
 * motivo e busca. É um grupo de opções exclusivas (radio), com a lista
 * rolável para o diálogo não passar da altura da tela.
 */
export function DeclineReasonPicker({
  value,
  onChange,
  error,
}: DeclineReasonPickerProps) {
  const [search, setSearch] = useState("");
  const baseId = useId();

  const groups = useMemo<DeclineReasonGroup[]>(() => {
    const query = normalizeForSearch(search.trim());
    if (!query) return DECLINE_REASON_GROUPS;
    return DECLINE_REASON_GROUPS.map((group) => ({
      ...group,
      options: group.options.filter((option) =>
        normalizeForSearch(`${option.label} ${option.description}`).includes(
          query,
        ),
      ),
    })).filter((group) => group.options.length > 0);
  }, [search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <FieldLabel required>Motivo</FieldLabel>
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar motivo"
          aria-label="Buscar motivo"
          className="pl-9"
        />
      </div>
      <div
        role="radiogroup"
        aria-label="Motivo"
        aria-invalid={error ? true : undefined}
        className={cn(
          "-mx-1 flex min-h-[8rem] flex-1 flex-col gap-3 overflow-y-auto px-1 py-0.5",
          error && "rounded-xl ring-1 ring-destructive",
        )}
      >
        {groups.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Nenhum motivo encontrado.
          </p>
        ) : null}
        {groups.map((group) => {
          const headingId = `${baseId}-${group.id}`;
          return (
            <div
              key={group.id}
              role="group"
              aria-labelledby={headingId}
              className="flex flex-col gap-1"
            >
              <p
                id={headingId}
                className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {group.title}
              </p>
              {group.options.map((option) => {
                const selected = option.value === value;
                const labelId = `${baseId}-${option.value}-label`;
                const descriptionId = `${baseId}-${option.value}-description`;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-labelledby={labelId}
                    aria-describedby={descriptionId}
                    onClick={() => onChange(option.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-brand-navy bg-brand-navy/10"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                        selected ? "border-brand-navy" : "border-border",
                      )}
                    >
                      {selected ? (
                        <span className="size-2 rounded-full bg-brand-navy" />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span
                        id={labelId}
                        className="text-sm font-semibold text-foreground"
                      >
                        {option.label}
                      </span>
                      <span
                        id={descriptionId}
                        className="text-xs text-muted-foreground"
                      >
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <FieldErrorMessage error={error} />
    </div>
  );
}
