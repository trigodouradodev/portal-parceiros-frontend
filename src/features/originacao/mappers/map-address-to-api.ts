import type { AddressData } from "@/features/originacao/data/proposal";
import { mapAddressToPayload } from "@/services/quotes/map-quote-form";
import type { SaveQuoteAddressPayload } from "@/services/quotes/quotes.types";

/** Traduz o passo Endereço para o contrato do PATCH. */
export function mapAddressToApi(data: AddressData): SaveQuoteAddressPayload {
  return mapAddressToPayload(data);
}
