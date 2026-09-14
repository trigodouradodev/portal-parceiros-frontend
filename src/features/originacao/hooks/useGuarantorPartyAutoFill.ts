import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { useToast } from "@/contexts/toast/toast-context";
import { mapPartyToGuarantorFill } from "@/features/originacao/mappers/map-party-to-guarantor";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isValidCpf } from "@/lib/validation/cpf";
import {
  partiesKeys,
  partiesService,
} from "@/services/parties/parties.service";
import type { PartyFormData } from "@/services/parties/parties.types";

export type PartyLookupStatus = "idle" | "searching" | "found";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export function useGuarantorPartyAutoFill() {
  const { setValue } = useFormContext<ProposalFormData>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PartyLookupStatus>("idle");
  const activeDigitsRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      const digits = activeDigitsRef.current;
      if (digits) {
        queryClient.cancelQueries({ queryKey: partiesKeys.byCpf(digits) });
      }
    };
  }, [queryClient]);

  async function lookup(digits: string) {
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
        staleTime: 60 * 60 * 1000,
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
  }

  function applyFill(party: PartyFormData | null) {
    if (!party) {
      setStatus("idle");
      return;
    }

    const fill = mapPartyToGuarantorFill(party);
    const options = { shouldDirty: true, shouldValidate: true };
    const fields = [
      "name",
      "email",
      "phone",
      "zipCode",
      "street",
      "number",
      "complement",
      "neighborhood",
      "city",
      "state",
    ] as const;
    for (const field of fields) {
      const value = fill[field];
      if (value) setValue(`guarantor.${field}`, value, options);
    }
    setStatus("found");
  }

  function onCpfComplete(digits: string) {
    if (!isValidCpf(digits)) return;
    lookup(digits);
  }

  function onCpfIncomplete() {
    const previous = activeDigitsRef.current;
    activeDigitsRef.current = null;
    if (previous) {
      queryClient.cancelQueries({ queryKey: partiesKeys.byCpf(previous) });
    }
    setStatus("idle");
  }

  return { status, onCpfComplete, onCpfIncomplete };
}
