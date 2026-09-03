import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { originationKeys } from "@/services/origination/origination.service";
import { SimulationStatus } from "@/services/origination/origination.types";
import { quotesKeys, quotesService } from "@/services/quotes/quotes.service";
import type { QuoteDraftSnapshot } from "@/services/quotes/quotes.types";

function markSimulationConverted(
  prev: SimulationSnapshot[] | undefined,
  simulationId: string,
): SimulationSnapshot[] | undefined {
  if (!prev) return prev;
  return prev.map((item) =>
    item.id === simulationId
      ? { ...item, status: SimulationStatus.CONVERTED }
      : item,
  );
}

export function useCreateQuoteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (simulationId: string) =>
      quotesService.createDraft({ simulationId }),
    onSuccess: (draft: QuoteDraftSnapshot) => {
      queryClient.setQueriesData<SimulationSnapshot[]>(
        { queryKey: originationKeys.simulationsRoot() },
        (prev) => markSimulationConverted(prev, draft.simulationId),
      );
      queryClient.invalidateQueries({
        queryKey: originationKeys.simulationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: quotesKeys.listRoot(),
      });
    },
  });
}
