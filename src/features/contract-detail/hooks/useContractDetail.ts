import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { TaskTab, isTaskTab } from "@/features/dashboard/constants/task-tab";
import type { ContractDetailLocationState } from "@/features/contract-detail/types";
import {
  mapOverdueContractToDetail,
  mapPreventiveContractToDetail,
} from "@/features/contract-detail/utils/map-to-detail";
import type { DetailMode } from "@/features/contract-detail/types";
import {
  useOverdueContractsInfinite,
  usePreventiveContractsInfinite,
} from "@/hooks/useDashboard";
import type {
  OverdueContract,
  PreventiveContract,
} from "@/services/dashboard/dashboard.types";

function isOverdueContract(
  contract: OverdueContract | PreventiveContract,
): contract is OverdueContract {
  return "firstOverdueInstallment" in contract;
}

export function useContractDetail(contractId: string, mode: DetailMode) {
  const location = useLocation();
  const locationState = location.state as ContractDetailLocationState | null;

  const overdueQuery = useOverdueContractsInfinite(30);
  const preventiveQuery = usePreventiveContractsInfinite(30, 15);

  const overdueContracts = useMemo(
    () => overdueQuery.data?.pages.flatMap((page) => page.contracts) ?? [],
    [overdueQuery.data?.pages],
  );
  const preventiveContracts = useMemo(
    () => preventiveQuery.data?.pages.flatMap((page) => page.contracts) ?? [],
    [preventiveQuery.data?.pages],
  );

  const contract = useMemo(() => {
    if (mode === TaskTab.Charge) {
      const fromCache = overdueContracts.find(
        (c) => c.contractId === contractId,
      );
      if (fromCache) return fromCache;

      const fromState = locationState?.contract;
      if (fromState && isOverdueContract(fromState)) {
        return fromState;
      }
      return undefined;
    }

    const fromCache = preventiveContracts.find(
      (c) => c.contractId === contractId,
    );
    if (fromCache) return fromCache;

    const fromState = locationState?.contract;
    if (fromState && !isOverdueContract(fromState)) {
      return fromState;
    }
    return undefined;
  }, [
    mode,
    contractId,
    overdueContracts,
    preventiveContracts,
    locationState?.contract,
  ]);

  const detail = useMemo(() => {
    if (!contract) return undefined;
    if (mode === TaskTab.Charge && isOverdueContract(contract)) {
      return mapOverdueContractToDetail(contract);
    }
    if (mode === TaskTab.Preventive && !isOverdueContract(contract)) {
      return mapPreventiveContractToDetail(contract);
    }
    return undefined;
  }, [contract, mode]);

  const isLoading =
    mode === TaskTab.Charge
      ? overdueQuery.isLoading
      : preventiveQuery.isLoading;

  return { detail, contract, isLoading, mode };
}

export function parseDetailMode(value: string | null): DetailMode {
  if (value && isTaskTab(value)) {
    return value;
  }
  return TaskTab.Charge;
}
