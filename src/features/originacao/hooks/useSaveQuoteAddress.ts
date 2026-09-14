import { useMutation } from "@tanstack/react-query";
import type { AddressData } from "@/features/originacao/data/proposal";
import { mapAddressToApi } from "@/features/originacao/mappers/map-address-to-api";
import { quotesService } from "@/services/quotes/quotes.service";

export function useSaveQuoteAddress() {
  return useMutation({
    mutationFn: ({
      quoteId,
      address,
    }: {
      quoteId: string;
      address: AddressData;
    }) => quotesService.saveAddress(quoteId, mapAddressToApi(address)),
  });
}
