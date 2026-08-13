/** Calcula idade em anos a partir de data ISO `YYYY-MM-DD` (calendário local). */
export function calcAge(
  isoDate: string,
  today: Date = new Date(),
): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;

  const [year, month, day] = isoDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return null;
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
}

/** Cliente elegível à consulta: 18–120 anos. */
export function isAdultAge(age: number | null): boolean {
  return age !== null && age >= 18 && age <= 120;
}

/** Data de hoje em `YYYY-MM-DD` no fuso local. */
export function todayIsoLocal(today: Date = new Date()): string {
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
