import type { PartnerOpinionData } from "@/features/originacao/data/proposal";
import { mapPartnerOpinionToPayload } from "@/services/quotes/map-quote-form";
import type { SaveQuotePartnerOpinionPayload } from "@/services/quotes/quotes.types";

/** Traduz o passo Parecer para o contrato do PATCH. */
export function mapPartnerOpinionToApi(
  data: PartnerOpinionData,
): SaveQuotePartnerOpinionPayload {
  return mapPartnerOpinionToPayload(data);
}
