import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { useToast } from "@/contexts/toast/toast-context";
import {
  applyAddressFill,
  type AddressPrefix,
} from "@/features/originacao/utils/apply-address-fill";
import type { ProposalFormData } from "@/features/originacao/data/proposal";
import { isCepLookupError } from "@/services/cep/cep-lookup-error";
import { cepService } from "@/services/cep/cep.service";
import type { CepLookupResult } from "@/services/cep/cep.types";

export type CepStatus = "idle" | "searching" | "found";

export const cepKeys = {
  all: ["cep"] as const,
  byCep: (digits: string) => [...cepKeys.all, digits] as const,
};

const CEP_STALE_TIME_MS = 60 * 60 * 1000;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export function useCepAutoFill(namePrefix: AddressPrefix) {
  const { setValue } = useFormContext<ProposalFormData>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const activeDigitsRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      const digits = activeDigitsRef.current;
      if (digits) {
        void queryClient.cancelQueries({ queryKey: cepKeys.byCep(digits) });
      }
    };
  }, [queryClient]);

  async function lookup(digits: string) {
    const previous = activeDigitsRef.current;
    if (previous && previous !== digits) {
      void queryClient.cancelQueries({ queryKey: cepKeys.byCep(previous) });
    }
    activeDigitsRef.current = digits;

    const cached = queryClient.getQueryData<CepLookupResult>(
      cepKeys.byCep(digits),
    );
    if (cached) {
      applyAddressFill(setValue, namePrefix, cached);
      setCepStatus("found");
      return;
    }

    setCepStatus("searching");
    try {
      const fill = await queryClient.fetchQuery({
        queryKey: cepKeys.byCep(digits),
        queryFn: ({ signal }) => cepService.lookup(digits, signal),
        staleTime: CEP_STALE_TIME_MS,
        retry: false,
      });
      if (activeDigitsRef.current !== digits) return;
      applyAddressFill(setValue, namePrefix, fill);
      setCepStatus("found");
    } catch (error) {
      if (activeDigitsRef.current !== digits) return;
      if (isAbortError(error)) return;

      setCepStatus("idle");
      queryClient.removeQueries({ queryKey: cepKeys.byCep(digits) });
      showToast(
        isCepLookupError(error)
          ? error.message
          : "Não foi possível buscar o endereço pelo CEP.",
        { variant: "destructive" },
      );
    }
  }

  function onZipCodeComplete(digits: string) {
    void lookup(digits);
  }

  function onZipCodeIncomplete() {
    const previous = activeDigitsRef.current;
    activeDigitsRef.current = null;
    if (previous) {
      void queryClient.cancelQueries({ queryKey: cepKeys.byCep(previous) });
    }
    setCepStatus("idle");
  }

  return { cepStatus, onZipCodeComplete, onZipCodeIncomplete };
}
