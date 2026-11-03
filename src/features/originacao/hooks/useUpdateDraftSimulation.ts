import { useMutation, useQueryClient } from "@tanstack/react-query";
import { originationKeys } from "@/services/origination/origination.service";
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";
import type { UpdateDraftSimulationPayload } from "@/services/quotes/quotes.types";

/** Altera as condições comerciais de uma proposta em rascunho (AUREA-701). */
export function useUpdateDraftSimulation(quoteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDraftSimulationPayload) =>
      quotesService.updateDraftSimulation(quoteId, payload),
    onSuccess: () => {
      // Simulação, proposta e anexos (limite do comprovante de renda) mudaram.
      void queryClient.invalidateQueries({
        queryKey: originationKeys.simulationsRoot(),
      });
      void queryClient.invalidateQueries({ queryKey: quotesKeys.listRoot() });
      void queryClient.invalidateQueries({
        queryKey: quotesKeys.detail(quoteId),
      });
      void queryClient.invalidateQueries({
        queryKey: quotesKeys.attachments(quoteId),
      });
    },
  });
}
