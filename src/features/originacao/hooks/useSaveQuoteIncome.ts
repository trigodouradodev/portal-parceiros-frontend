import { useMutation } from "@tanstack/react-query";
import type { ActivityIncomeData } from "@/features/originacao/data/proposal";
import { mapIncomeToApi } from "@/features/originacao/mappers/map-income-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuoteIncome() {
  return useMutation({
    mutationFn: ({
      quoteId,
      activityIncome,
    }: {
      quoteId: string;
      activityIncome: ActivityIncomeData;
    }) => quotesService.saveIncome(quoteId, mapIncomeToApi(activityIncome)),
  });
}
