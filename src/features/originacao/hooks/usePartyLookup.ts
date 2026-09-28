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

export type PartyFill<F extends string> = Partial<Record<F, string>>;

export interface PartyFillTarget<F extends string> {
  mapParty: (party: PartyFormData) => PartyFill<F>;
  read: (field: F) => unknown;
  write: (field: F, value: string) => void;
  clear: (field: F) => void;
}

/**
 * Busca a party pelo CPF e preenche os campos do formulário. Lembra o que
 * preencheu para limpar ao trocar de CPF, sem apagar o que o usuário editou.
 */
export function usePartyLookup<F extends string>(target: PartyFillTarget<F>) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PartyLookupStatus>("idle");
  const activeDigitsRef = useRef<string | null>(null);
  const filledRef = useRef(new Map<F, string>());
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const clearFilled = useCallback(() => {
    const { read, clear } = targetRef.current;
    for (const [field, value] of filledRef.current) {
      if (read(field) === value) clear(field);
    }
    filledRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      const digits = activeDigitsRef.current;
      if (digits) {
        queryClient.cancelQueries({ queryKey: partiesKeys.byCpf(digits) });
      }
    };
  }, [queryClient]);

  const applyFill = useCallback(
    (party: PartyFormData | null) => {
      clearFilled();
      if (!party) {
        setStatus("idle");
        return;
      }
      const { mapParty, write } = targetRef.current;
      const fill = mapParty(party);
      for (const field of Object.keys(fill) as F[]) {
        const value = fill[field];
        if (!value) continue;
        write(field, value);
        filledRef.current.set(field, value);
      }
      setStatus("found");
    },
    [clearFilled],
  );

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

        clearFilled();
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
    [applyFill, clearFilled, queryClient, showToast],
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
    clearFilled();
    setStatus("idle");
  }, [clearFilled, queryClient]);

  return { status, onCpfComplete, onCpfIncomplete };
}
