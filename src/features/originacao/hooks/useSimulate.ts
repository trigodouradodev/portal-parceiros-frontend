import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

export function useSimulate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: originationService.simulate,
    onSuccess: (result) => {
      if (!result.eligible) return;

      const snapshot = result.simulation;
      queryClient.setQueryData<SimulationSnapshot[]>(
        originationKeys.simulations(),
        (previous) => {
          const current = previous ?? [];
          const existingIndex = current.findIndex(
            (item) => item.id === snapshot.id,
          );
          if (existingIndex === -1) return [snapshot, ...current];

          const next = [...current];
          next[existingIndex] = snapshot;
          return next;
        },
      );
      queryClient.invalidateQueries({
        queryKey: originationKeys.simulationsRoot(),
      });
    },
  });
}
