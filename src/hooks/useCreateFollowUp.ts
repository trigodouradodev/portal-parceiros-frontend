import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followupService } from "@/services/followup/followup.service";
import type { CreateFollowUpPayload } from "@/services/followup/followup.types";
import { dashboardKeys } from "@/hooks/useDashboard";

export function useCreateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFollowUpPayload) =>
      followupService.createFollowUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
