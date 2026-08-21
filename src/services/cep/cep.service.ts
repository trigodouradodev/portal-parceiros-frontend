import { CepLookupError } from "@/services/cep/cep-lookup-error";
import type { CepLookupResult, ViaCepResponse } from "@/services/cep/cep.types";
import { mapViaCepResponse } from "@/services/cep/map-via-cep";

export const CEP_LOOKUP_TIMEOUT_MS = 5_000;

const VIA_CEP_URL = "https://viacep.com.br/ws";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

function digitsOf(cep: string): string {
  return cep.replace(/\D/g, "");
}

export const cepService = {
  /**
   * Consulta o ViaCEP direto (API pública, sem o axios autenticado do portal).
   * Cancela no `signal` do caller ou após {@link CEP_LOOKUP_TIMEOUT_MS}.
   */
  async lookup(cep: string, signal?: AbortSignal): Promise<CepLookupResult> {
    const digits = digitsOf(cep);
    if (digits.length !== 8) {
      throw new CepLookupError("CEP deve ter 8 dígitos.", "invalid");
    }

    const controller = new AbortController();
    const onParentAbort = () => controller.abort();
    signal?.addEventListener("abort", onParentAbort);
    const timer = setTimeout(() => controller.abort(), CEP_LOOKUP_TIMEOUT_MS);

    try {
      const response = await fetch(`${VIA_CEP_URL}/${digits}/json/`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new CepLookupError(
          "Não foi possível buscar o endereço pelo CEP.",
          "network",
        );
      }

      const data = (await response.json()) as ViaCepResponse;
      if (data.erro) {
        throw new CepLookupError("CEP não encontrado.", "not_found");
      }

      return mapViaCepResponse(data);
    } catch (error) {
      if (error instanceof CepLookupError) throw error;
      if (isAbortError(error)) {
        if (signal?.aborted) throw error;
        throw new CepLookupError("Tempo de busca do CEP esgotado.", "timeout");
      }
      throw new CepLookupError(
        "Não foi possível buscar o endereço pelo CEP.",
        "network",
      );
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onParentAbort);
    }
  },
};
