import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function formatDate(isoDate: string): string {
  return formatIfValid(isoDate, "dd/MM/yyyy");
}

export function formatDateTime(isoDate: string): string {
  return formatIfValid(isoDate, "dd/MM/yyyy HH:mm");
}

export function formatShortDateTime(isoDate: string): string {
  return formatIfValid(isoDate, "dd/MM HH:mm");
}
