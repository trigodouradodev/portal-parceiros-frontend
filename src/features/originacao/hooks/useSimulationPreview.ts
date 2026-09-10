import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";
import type { PreviewSimulationPayload } from "@/services/origination/origination.types";

const PREVIEW_DEBOUNCE_MS = 400;

function previewKey(payload: PreviewSimulationPayload | null): string {
  if (!payload) return "";
  return [
    payload.productId,
    payload.amount,
    payload.installments,
    payload.firstInstallmentDate,
  ].join("|");
}

/**
 * Preview da parcela oficial (Celcoin) com debounce nos inputs financeiros.
 * Não usa PRICE local — o valor bate com o que o POST/PATCH persiste.
 */
export function useSimulationPreview(
  payload: PreviewSimulationPayload | null,
  options?: { enabled?: boolean },
) {
  const key = previewKey(payload);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const [debounced, setDebounced] = useState(payload);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(payloadRef.current);
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [key]);

  const enabled =
    (options?.enabled ?? true) &&
    debounced != null &&
    Boolean(debounced.productId) &&
    Number.isFinite(debounced.amount) &&
    Number.isFinite(debounced.installments) &&
    Boolean(debounced.firstInstallmentDate);

  return useQuery({
    queryKey: originationKeys.preview(
      debounced ?? {
        productId: "",
        amount: 0,
        installments: 0,
        firstInstallmentDate: "",
      },
    ),
    queryFn: () => originationService.previewSimulation(debounced!),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}
