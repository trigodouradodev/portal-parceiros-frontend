import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: originationService.createSimulation,
    onSuccess: (snapshot) => {
      queryClient.setQueryData<SimulationSnapshot[]>(
        originationKeys.simulations(),
        (prev) => [
          snapshot,
          ...(prev ?? []).filter((item) => item.id !== snapshot.id),
        ],
      );
      queryClient.invalidateQueries({
        queryKey: originationKeys.simulationsRoot(),
      });
    },
  });
}
