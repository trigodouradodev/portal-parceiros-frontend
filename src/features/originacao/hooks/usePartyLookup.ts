import { useCallback, useEffect, useState } from "react";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isValidCpf } from "@/lib/validation/cpf";
import {
  partiesKeys,
  partiesService,
} from "@/services/parties/parties.service";

export type PartyLookupStatus = "idle" | "searching" | "found";

const PARTY_LOOKUP_STALE_TIME_MS = 60 * 60 * 1000;

function validCpfDigits(value: string | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  return isValidCpf(digits) ? digits : null;
}

export function usePartyLookup(initialCpf?: string) {
  const { showToast } = useToast();
  const [cpf, setCpf] = useState(() => validCpfDigits(initialCpf));

  const query = useQuery({
    queryKey: partiesKeys.byCpf(cpf ?? ""),
    queryFn: cpf
      ? ({ signal }) => partiesService.findFormDataByCpf(cpf, signal)
      : skipToken,
    staleTime: PARTY_LOOKUP_STALE_TIME_MS,
    retry: false,
  });

  const { error } = query;
  useEffect(() => {
    if (!error) return;
    showToast(
      getApiErrorMessage(error, "Não foi possível buscar o cadastro pelo CPF."),
      { variant: "destructive" },
    );
  }, [error, showToast]);

  const party = cpf ? (query.data ?? null) : null;
  const status: PartyLookupStatus = query.isLoading
    ? "searching"
    : party
      ? "found"
      : "idle";

  const onCpfChange = useCallback((value: string) => {
    setCpf(validCpfDigits(value));
  }, []);

  return { party, status, onCpfChange };
}
