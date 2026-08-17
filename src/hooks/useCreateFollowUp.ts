import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followupService } from "@/services/followup/followup.service";
import type { CreateFollowUpPayload } from "@/services/followup/followup.types";
import { dashboardKeys } from "@/hooks/useDashboard";
import { collectionKeys } from "@/hooks/useCollectionDetail";

export function useCreateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFollowUpPayload) =>
      followupService.createFollowUp(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      if (payload.contractId && payload.installmentNumber) {
        queryClient.invalidateQueries({
          queryKey: collectionKeys.detail(
            payload.contractId,
            payload.installmentNumber,
          ),
        });
      }
    },
  });
}
