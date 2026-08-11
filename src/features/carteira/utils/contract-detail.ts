import { parseCalendarDate } from "@/lib/format/date";

/**
 * Dias em atraso a partir do próximo vencimento (parcela aberta mais antiga).
 * Fallback enquanto a API não envia `daysOverdue`.
 */
export function daysOverdueFromDueDate(dueDate?: string): number | null {
  if (!dueDate) return null;
  const due = parseCalendarDate(dueDate);
  if (!due) return null;
  const today = new Date();
  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffMs = startToday.getTime() - due.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}

export function formatDaysOverdue(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "Em dia";
  return `${days} dia${days === 1 ? "" : "s"}`;
}

/** `undefined` = API ainda não envia o campo. */
export function formatRenegotiated(value?: boolean): string {
  if (value === undefined) return "—";
  return value ? "Sim" : "Não";
}
