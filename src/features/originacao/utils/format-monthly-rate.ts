export function formatMonthlyRate(rate: number) {
  return `${rate.toFixed(2).replace(".", ",")}% ao mês`;
}
