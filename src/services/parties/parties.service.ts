import { api } from "@/lib/api/axios";
import type { PartyFormData, PartyFormLookupResponse } from "./parties.types";

export const PARTY_LOOKUP_TIMEOUT_MS = 5_000;

export const partiesKeys = {
  all: ["parties"] as const,
  byCpf: (digits: string) => [...partiesKeys.all, "by-cpf", digits] as const,
};

export const partiesService = {
  /** GET /parties/by-cpf/:cpf — `party` nulo quando o CPF não está cadastrado. */
  async findFormDataByCpf(
    cpfDigits: string,
    signal?: AbortSignal,
  ): Promise<PartyFormData | null> {
    const { data } = await api.get<PartyFormLookupResponse>(
      `/parties/by-cpf/${cpfDigits}`,
      { signal, timeout: PARTY_LOOKUP_TIMEOUT_MS },
    );
    return data.party;
  },
};
