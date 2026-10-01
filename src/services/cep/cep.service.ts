import { isAxiosError, isCancel } from "axios";
import { formatCep } from "@/features/originacao/utils/format-cep";
import {
  CepLookupError,
  isCepLookupError,
} from "@/services/cep/cep-lookup-error";
import type { CepLookupResult } from "@/services/cep/cep.types";
import {
  CEP_LOOKUP_TIMEOUT_MS,
  locationsService,
} from "@/services/locations/locations.service";
import type { PostalCodeAddress } from "@/services/locations/locations.types";

export { CEP_LOOKUP_TIMEOUT_MS };

function digitsOf(cep: string): string {
  return cep.replace(/\D/g, "");
}

export function mapPostalCodeAddress(data: PostalCodeAddress): CepLookupResult {
  return {
    zipCode: formatCep(data.zipCode),
    street: data.streetName.trim(),
    neighborhood: data.streetDistrict.trim(),
    city: data.city.trim(),
    state: data.state.trim().toUpperCase(),
  };
}

function isTimeoutError(error: unknown): boolean {
  return isAxiosError(error) && error.code === "ECONNABORTED";
}

export const cepService = {
  /**
   * Consulta CEP via portal (`GET /locations/postal-code/:zipCode`).
   * Cancela no `signal` do caller ou após {@link CEP_LOOKUP_TIMEOUT_MS}.
   */
  async lookup(cep: string, signal?: AbortSignal): Promise<CepLookupResult> {
    const digits = digitsOf(cep);
    if (digits.length !== 8) {
      throw new CepLookupError("CEP deve ter 8 dígitos.", "invalid");
    }

    try {
      const data = await locationsService.findPostalCode(digits, signal);
      return mapPostalCodeAddress(data);
    } catch (error) {
      if (isCepLookupError(error)) throw error;
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      if (isCancel(error) || isTimeoutError(error)) {
        throw new CepLookupError("Tempo de busca do CEP esgotado.", "timeout");
      }
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          throw new CepLookupError("CEP deve ter 8 dígitos.", "invalid");
        }
        if (status === 404) {
          throw new CepLookupError("CEP não encontrado.", "not_found");
        }
      }
      throw new CepLookupError(
        "Não foi possível buscar o endereço pelo CEP.",
        "network",
      );
    }
  },
};
