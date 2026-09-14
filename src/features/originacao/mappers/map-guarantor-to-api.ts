import type { GuarantorData } from "@/features/originacao/data/proposal";
import { mapGuarantorToPayload } from "@/services/quotes/map-quote-form";
import type { SaveQuoteGuarantorPayload } from "@/services/quotes/quotes.types";

/** Traduz o passo Avalista para o contrato do PATCH. */
export function mapGuarantorToApi(
  data: GuarantorData,
): SaveQuoteGuarantorPayload {
  return mapGuarantorToPayload(data);
}
