import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";

export function useApplyRenewalPrefill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quotesService.applyRenewalPrefill(quoteId),
    onSuccess: ({ quote }) => {
      queryClient.setQueryData(quotesKeys.detail(quote.id), quote);
      void queryClient.invalidateQueries({ queryKey: quotesKeys.listRoot() });
    },
  });
}
