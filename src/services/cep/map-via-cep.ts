import { formatCep } from "@/features/originacao/utils/format-cep";
import type { CepLookupResult, ViaCepResponse } from "@/services/cep/cep.types";

function text(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** Converte o JSON do ViaCEP para os campos do formulário. Não mapeia número nem complemento. */
export function mapViaCepResponse(data: ViaCepResponse): CepLookupResult {
  return {
    zipCode: formatCep(text(data.cep)),
    street: text(data.logradouro),
    neighborhood: text(data.bairro),
    city: text(data.localidade),
    state: text(data.uf).toUpperCase(),
  };
}
