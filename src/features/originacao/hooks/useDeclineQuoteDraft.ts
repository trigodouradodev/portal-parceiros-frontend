import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";
import type { DeclineQuotePayload } from "@/services/quotes/quotes.types";

/** Recusa um rascunho da Canal Digital, com o motivo. */
export function useDeclineQuoteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quoteId,
      payload,
    }: {
      quoteId: string;
      payload: DeclineQuotePayload;
    }) => quotesService.declineDraft(quoteId, payload),
    onSuccess: (_result, { quoteId }) => {
      void queryClient.invalidateQueries({ queryKey: quotesKeys.listRoot() });
      void queryClient.invalidateQueries({
        queryKey: quotesKeys.detail(quoteId),
      });
    },
  });
}
