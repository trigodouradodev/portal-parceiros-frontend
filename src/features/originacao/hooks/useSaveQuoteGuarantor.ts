import { useMutation } from "@tanstack/react-query";
import type { GuarantorData } from "@/features/originacao/data/proposal";
import { mapGuarantorToApi } from "@/features/originacao/mappers/map-guarantor-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuoteGuarantor() {
  return useMutation({
    mutationFn: ({
      quoteId,
      guarantor,
    }: {
      quoteId: string;
      guarantor: GuarantorData;
    }) => quotesService.saveGuarantor(quoteId, mapGuarantorToApi(guarantor)),
  });
}
