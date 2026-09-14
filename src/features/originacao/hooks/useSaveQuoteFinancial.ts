import { useMutation } from "@tanstack/react-query";
import type { FinancialData } from "@/features/originacao/data/proposal";
import { mapFinancialToApi } from "@/features/originacao/mappers/map-financial-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuoteFinancial() {
  return useMutation({
    mutationFn: ({
      quoteId,
      financial,
    }: {
      quoteId: string;
      financial: FinancialData;
    }) => quotesService.saveFinancial(quoteId, mapFinancialToApi(financial)),
  });
}
