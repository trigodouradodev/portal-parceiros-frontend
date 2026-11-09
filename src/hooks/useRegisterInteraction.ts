import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesKeys } from "@/hooks/useActivities";
import { installmentKeys } from "@/hooks/useInstallmentDetail";
import { activitiesService } from "@/services/activities/activities.service";
import type { RegisterInteractionVariables } from "@/services/activities/activities.types";
import { dashboardKeys } from "@/hooks/useDashboard";
import { collectionKeys } from "@/hooks/useCollectionDetail";
import { quoteActivityPermissionsKeys } from "@/hooks/useQuoteActivityPermissions";
import { isStaleTaskError } from "@/lib/api/task-action-errors";

export function useRegisterInteraction() {
  const queryClient = useQueryClient();

  function refresh(variables: RegisterInteractionVariables) {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
    queryClient.invalidateQueries({
      queryKey: quoteActivityPermissionsKeys.all,
    });

    if (variables.installmentId) {
      queryClient.invalidateQueries({
        queryKey: installmentKeys.detail(variables.installmentId),
      });
    }

    if (variables.contractId && variables.installmentNumber) {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.detail(
          variables.contractId,
          variables.installmentNumber,
        ),
      });
    }
  }

  return useMutation({
    mutationFn: ({ taskId, payload }: RegisterInteractionVariables) =>
      activitiesService.registerInteraction(taskId, payload),
    onSuccess: (_data, variables) => refresh(variables),
    onError: (error, variables) => {
      if (isStaleTaskError(error)) refresh(variables);
    },
  });
}
