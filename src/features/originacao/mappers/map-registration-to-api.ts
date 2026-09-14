import type { RegistrationData } from "@/features/originacao/data/proposal";
import { mapRegistrationToPayload } from "@/services/quotes/map-quote-form";
import type { SaveQuoteRegistrationPayload } from "@/services/quotes/quotes.types";

/**
 * Traduz o passo Cadastro para o contrato do PATCH.
 * O form grava códigos estáveis; este wrapper mantém o nome usado pelo hook AUREA-429.
 */
export function mapRegistrationToApi(
  data: RegistrationData,
): SaveQuoteRegistrationPayload {
  return mapRegistrationToPayload(data);
}
