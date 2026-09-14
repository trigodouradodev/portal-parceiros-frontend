import { useMutation } from "@tanstack/react-query";
import type { RegistrationData } from "@/features/originacao/data/proposal";
import { mapRegistrationToApi } from "@/features/originacao/mappers/map-registration-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuoteRegistration() {
  return useMutation({
    mutationFn: ({
      quoteId,
      registration,
    }: {
      quoteId: string;
      registration: RegistrationData;
    }) =>
      quotesService.saveDraftRegistration(
        quoteId,
        mapRegistrationToApi(registration),
      ),
  });
}
