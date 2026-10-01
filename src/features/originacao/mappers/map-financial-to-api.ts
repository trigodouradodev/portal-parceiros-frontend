import type { FinancialData } from "@/features/originacao/data/proposal";
import { mapFinancialToPayload } from "@/services/quotes/map-quote-form";
import type { SaveQuoteFinancialPayload } from "@/services/quotes/quotes.types";

/** Traduz o passo Financeiro para o contrato do PATCH. */
export function mapFinancialToApi(
  data: FinancialData,
): SaveQuoteFinancialPayload {
  return mapFinancialToPayload(data);
}
