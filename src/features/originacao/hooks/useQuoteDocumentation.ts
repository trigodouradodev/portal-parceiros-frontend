import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";
import type { UploadQuoteAttachmentInput } from "@/services/quotes/quotes.types";

export function useQuoteAttachments(quoteId: string) {
  return useQuery({
    queryKey: quotesKeys.attachments(quoteId),
    queryFn: () => quotesService.listAttachments(quoteId),
    enabled: Boolean(quoteId),
  });
}

export function useUploadQuoteAttachment(quoteId: string) {
  return useMutation({
    mutationFn: (input: UploadQuoteAttachmentInput) =>
      quotesService.uploadAttachment(quoteId, input),
  });
}

export function useRemoveQuoteAttachment(quoteId: string) {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      quotesService.removeAttachment(quoteId, attachmentId),
  });
}

export function useCompleteQuoteDocumentation() {
  return useMutation({
    mutationFn: (quoteId: string) =>
      quotesService.completeDocumentation(quoteId),
  });
}

export function useSubmitQuoteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quotesService.submitDraft(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.listRoot() });
    },
  });
}
