import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { TaskTab, isTaskTab } from "@/features/dashboard/constants/task-tab";
import type { ContractDetailLocationState } from "@/features/contract-detail/types";
import { mapCollectionDetailToView } from "@/features/contract-detail/mappers/map-collection-detail";
import type { DetailMode } from "@/features/contract-detail/types";
import { useCollectionDetail } from "@/hooks/useCollectionDetail";
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

function parseInstallmentNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function getInstallmentFromContract(
  contract: OverdueContract | PreventiveContract,
  mode: DetailMode,
): number | undefined {
  if (mode === TaskTab.Charge && isOverdueContract(contract)) {
    return contract.firstOverdueInstallment.installmentNumber;
  }

  if (mode === TaskTab.Preventive && !isOverdueContract(contract)) {
    return contract.nextInstallment.installmentNumber;
  }

  return undefined;
}

export function useContractDetail(contractId: string, mode: DetailMode) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  const listContract = useMemo(() => {
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

  const installmentNumber = useMemo(() => {
    const fromUrl = parseInstallmentNumber(searchParams.get("installment"));
    if (fromUrl) return fromUrl;

    if (listContract) {
      return getInstallmentFromContract(listContract, mode);
    }

    return undefined;
  }, [searchParams, listContract, mode]);

  const detailQuery = useCollectionDetail(contractId, installmentNumber);

  const detail = useMemo(() => {
    if (!detailQuery.data) return undefined;
    return mapCollectionDetailToView(detailQuery.data, mode, {
      contract: listContract,
    });
  }, [detailQuery.data, mode, listContract]);

  const isLoading = detailQuery.isLoading;
  const isNotFound =
    !installmentNumber ||
    detailQuery.isError ||
    (!detailQuery.isLoading && !detailQuery.data);

  return {
    detail,
    contract: listContract,
    collectionDetail: detailQuery.data,
    installmentNumber,
    isLoading,
    isNotFound,
    mode,
  };
}

export function parseDetailMode(value: string | null): DetailMode {
  if (value && isTaskTab(value)) {
    return value;
  }
  return TaskTab.Charge;
}
