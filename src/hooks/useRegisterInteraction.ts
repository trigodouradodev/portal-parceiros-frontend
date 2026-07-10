import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesKeys } from "@/hooks/useActivities";
import { activitiesService } from "@/services/activities/activities.service";
import type { RegisterInteractionVariables } from "@/services/activities/activities.types";
import { dashboardKeys } from "@/hooks/useDashboard";
import { collectionKeys } from "@/hooks/useCollectionDetail";

export function useRegisterInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: RegisterInteractionVariables) =>
      activitiesService.registerInteraction(taskId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: activitiesKeys.all });

      if (variables.contractId && variables.installmentNumber) {
        queryClient.invalidateQueries({
          queryKey: collectionKeys.detail(
            variables.contractId,
            variables.installmentNumber,
          ),
        });
      }
    },
  });
}
