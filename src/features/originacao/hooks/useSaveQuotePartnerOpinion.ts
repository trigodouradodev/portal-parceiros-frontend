import { useMutation } from "@tanstack/react-query";
import type { PartnerOpinionData } from "@/features/originacao/data/proposal";
import { mapPartnerOpinionToApi } from "@/features/originacao/mappers/map-partner-opinion-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuotePartnerOpinion() {
  return useMutation({
    mutationFn: ({
      quoteId,
      partnerOpinion,
    }: {
      quoteId: string;
      partnerOpinion: PartnerOpinionData;
    }) =>
      quotesService.savePartnerOpinion(
        quoteId,
        mapPartnerOpinionToApi(partnerOpinion),
      ),
  });
}
