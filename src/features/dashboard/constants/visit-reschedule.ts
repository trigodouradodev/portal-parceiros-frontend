import { addDays, format, startOfDay } from "date-fns";

export const VISIT_RESCHEDULE_WINDOW_DAYS = 5;

export function getVisitRescheduleBounds(referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const min = addDays(today, 1);
  const max = addDays(today, VISIT_RESCHEDULE_WINDOW_DAYS);

  return {
    min,
    max,
    minIso: format(min, "yyyy-MM-dd"),
    maxIso: format(max, "yyyy-MM-dd"),
  };
}
