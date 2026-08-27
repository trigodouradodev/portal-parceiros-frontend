import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SimulacaoSnapshot } from "@/features/originacao/types";
import {
  originationKeys,
  originationService,
} from "@/services/origination/origination.service";

export function useCreateSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: originationService.createSimulation,
    onSuccess: (snapshot) => {
      queryClient.setQueryData<SimulacaoSnapshot[]>(
        originationKeys.simulations(),
        (prev) => [
          snapshot,
          ...(prev ?? []).filter((item) => item.id !== snapshot.id),
        ],
      );
    },
  });
}
