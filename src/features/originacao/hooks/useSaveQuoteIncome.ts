import { useMutation } from "@tanstack/react-query";
import type {
  ActivityIncomeData,
  RegistrationData,
} from "@/features/originacao/data/proposal";
import { mapIncomeToApi } from "@/features/originacao/mappers/map-income-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuoteIncome() {
  return useMutation({
    mutationFn: ({
      quoteId,
      activityIncome,
      registration,
    }: {
      quoteId: string;
      activityIncome: ActivityIncomeData;
      registration: RegistrationData;
    }) =>
      quotesService.saveIncome(
        quoteId,
        mapIncomeToApi(activityIncome, registration),
      ),
  });
}
