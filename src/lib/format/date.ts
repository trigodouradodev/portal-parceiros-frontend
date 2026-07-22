import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Datas de calendário (`@db.Date` / `YYYY-MM-DD`) costumam chegar como
 * `YYYY-MM-DDT00:00:00.000Z`. Formatar com o fuso local (ex.: BRT) desloca o dia.
 * Extrai ano/mês/dia do prefixo ISO e monta um Date em horário local.
 */
function parseCalendarDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    !isValid(date) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseIsoDate(isoDate: string): Date {
  const parsed = parseISO(isoDate);
  return isValid(parsed) ? parsed : new Date(isoDate);
}

function formatIfValid(isoDate: string, pattern: string): string {
  const date = parseIsoDate(isoDate);
  if (!isValid(date)) {
    return isoDate;
  }
  return format(date, pattern, { locale: ptBR });
}

/** Formata data de calendário (sem horário) — sem shift de timezone. */
export function formatDate(isoDate: string): string {
  const calendar = parseCalendarDate(isoDate);
  if (calendar) {
    return format(calendar, "dd/MM/yyyy", { locale: ptBR });
  }
  return formatIfValid(isoDate, "dd/MM/yyyy");
}

export function formatDateTime(isoDate: string): string {
  return formatIfValid(isoDate, "dd/MM/yyyy HH:mm");
}

export function formatShortDateTime(isoDate: string): string {
  return formatIfValid(isoDate, "dd/MM HH:mm");
}
