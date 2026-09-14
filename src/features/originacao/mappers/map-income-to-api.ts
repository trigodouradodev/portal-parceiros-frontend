import type { ActivityIncomeData } from "@/features/originacao/data/proposal";
import { mapIncomeToPayload } from "@/services/quotes/map-quote-form";
import type { SaveQuoteIncomePayload } from "@/services/quotes/quotes.types";

/** Traduz o passo Atividade e Renda para o contrato do PATCH. */
export function mapIncomeToApi(
  data: ActivityIncomeData,
): SaveQuoteIncomePayload {
  return mapIncomeToPayload(data);
}
