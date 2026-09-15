import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/toast/toast-context";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isValidCpf } from "@/lib/validation/cpf";
import {
  partiesKeys,
  partiesService,
} from "@/services/parties/parties.service";
import type { PartyFormData } from "@/services/parties/parties.types";

export type PartyLookupStatus = "idle" | "searching" | "found";

const PARTY_LOOKUP_STALE_TIME_MS = 60 * 60 * 1000;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export function usePartyLookup(onFound: (party: PartyFormData) => void) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PartyLookupStatus>("idle");
  const activeDigitsRef = useRef<string | null>(null);
  const onFoundRef = useRef(onFound);

  useEffect(() => {
    onFoundRef.current = onFound;
  }, [onFound]);

  useEffect(() => {
    return () => {
      const digits = activeDigitsRef.current;
      if (digits) {
        queryClient.cancelQueries({ queryKey: partiesKeys.byCpf(digits) });
      }
    };
  }, [queryClient]);

  const applyFill = useCallback((party: PartyFormData | null) => {
    if (!party) {
      setStatus("idle");
      return;
    }
    onFoundRef.current(party);
    setStatus("found");
  }, []);

  const lookup = useCallback(
    async (digits: string) => {
      const previous = activeDigitsRef.current;
      if (previous && previous !== digits) {
        queryClient.cancelQueries({ queryKey: partiesKeys.byCpf(previous) });
      }
      activeDigitsRef.current = digits;

      const cached = queryClient.getQueryData<PartyFormData | null>(
        partiesKeys.byCpf(digits),
      );
      if (cached !== undefined) {
        applyFill(cached);
        return;
      }

      setStatus("searching");
      try {
        const party = await queryClient.fetchQuery({
          queryKey: partiesKeys.byCpf(digits),
          queryFn: ({ signal }) =>
            partiesService.findFormDataByCpf(digits, signal),
          staleTime: PARTY_LOOKUP_STALE_TIME_MS,
          retry: false,
        });
        if (activeDigitsRef.current !== digits) return;
        applyFill(party);
      } catch (error) {
        if (activeDigitsRef.current !== digits) return;
        if (isAbortError(error)) return;

        setStatus("idle");
        queryClient.removeQueries({ queryKey: partiesKeys.byCpf(digits) });
        showToast(
          getApiErrorMessage(
            error,
            "Não foi possível buscar o cadastro pelo CPF.",
          ),
          { variant: "destructive" },
        );
      }
    },
    [applyFill, queryClient, showToast],
  );

  const onCpfComplete = useCallback(
    (digits: string) => {
      if (!isValidCpf(digits)) return;
      void lookup(digits);
    },
    [lookup],
  );

  const onCpfIncomplete = useCallback(() => {
    const previous = activeDigitsRef.current;
    activeDigitsRef.current = null;
    if (previous) {
      queryClient.cancelQueries({ queryKey: partiesKeys.byCpf(previous) });
    }
    setStatus("idle");
  }, [queryClient]);

  return { status, onCpfComplete, onCpfIncomplete };
}
