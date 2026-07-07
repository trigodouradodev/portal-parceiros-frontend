const MAX_PROMISE_DAYS = 10;

function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday(referenceDate = new Date()): Date {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getPromiseDateBounds(referenceDate = new Date()) {
  const minDate = startOfToday(referenceDate);
  const maxDate = new Date(minDate);
  maxDate.setDate(maxDate.getDate() + MAX_PROMISE_DAYS);

  return {
    min: toDateOnlyISO(minDate),
    max: toDateOnlyISO(maxDate),
  };
}

export function validatePromiseDate(
  value: string,
  referenceDate = new Date(),
): string | null {
  if (!value) {
    return "Selecione a data prevista de pagamento.";
  }

  const { min, max } = getPromiseDateBounds(referenceDate);

  if (value < min) {
    return "A data não pode ser anterior a hoje.";
  }

  if (value > max) {
    return "A data não pode ser superior a 10 dias.";
  }

  return null;
}
