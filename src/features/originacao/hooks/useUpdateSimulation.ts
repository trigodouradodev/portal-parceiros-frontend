import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SimulationSnapshot } from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";
import type { UpdateSimulationPayload } from "@/services/origination/origination.types";

export function useUpdateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSimulationPayload;
    }) => originationService.updateSimulation(id, payload),
    onSuccess: (snapshot) => {
      queryClient.setQueryData<SimulationSnapshot[]>(
        originationKeys.simulations(),
        (prev) =>
          (prev ?? []).map((item) =>
            item.id === snapshot.id ? snapshot : item,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: originationKeys.simulationsRoot(),
      });
    },
  });
}
