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

function isPreviewReady(
  payload: PreviewSimulationPayload | null,
): payload is PreviewSimulationPayload {
  if (!payload) return false;
  if (!payload.productId) return false;
  if (!payload.firstInstallmentDate) return false;
  if (!Number.isFinite(payload.amount)) return false;
  if (!Number.isFinite(payload.installments)) return false;
  return true;
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

  const ready = isPreviewReady(debounced);
  const enabled = (options?.enabled ?? true) && ready;

  return useQuery({
    queryKey: originationKeys.preview(
      ready
        ? debounced
        : {
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
