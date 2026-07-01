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
  OverdueCollectionItem,
  PreventiveCollectionItem,
} from "@/services/dashboard/dashboard.types";

export function isOverdueCollectionItem(
  item: OverdueCollectionItem | PreventiveCollectionItem,
): item is OverdueCollectionItem {
  return "daysOverdue" in item.installment;
}

function parseInstallmentNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function getInstallmentFromListItem(
  item: OverdueCollectionItem | PreventiveCollectionItem,
): number {
  return item.installment.number;
}

export function useContractDetail(contractId: string, mode: DetailMode) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as ContractDetailLocationState | null;

  const overdueQuery = useOverdueContractsInfinite(30);
  const preventiveQuery = usePreventiveContractsInfinite(30, 15);

  const overdueItems = useMemo(
    () => overdueQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [overdueQuery.data?.pages],
  );
  const preventiveItems = useMemo(
    () => preventiveQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [preventiveQuery.data?.pages],
  );

  const installmentFromUrl = parseInstallmentNumber(
    searchParams.get("installment"),
  );

  const listItem = useMemo(() => {
    const matchByInstallment = (
      items: (OverdueCollectionItem | PreventiveCollectionItem)[],
    ) =>
      items.find(
        (item) =>
          item.contract.id === contractId &&
          (installmentFromUrl === undefined ||
            item.installment.number === installmentFromUrl),
      );

    if (mode === TaskTab.Charge) {
      const fromCache = matchByInstallment(overdueItems);
      if (fromCache) return fromCache;

      const fromState = locationState?.item;
      if (fromState && isOverdueCollectionItem(fromState)) {
        return fromState;
      }
      return undefined;
    }

    const fromCache = matchByInstallment(preventiveItems);
    if (fromCache) return fromCache;

    const fromState = locationState?.item;
    if (fromState && !isOverdueCollectionItem(fromState)) {
      return fromState;
    }
    return undefined;
  }, [
    mode,
    contractId,
    installmentFromUrl,
    overdueItems,
    preventiveItems,
    locationState?.item,
  ]);

  const installmentNumber = useMemo(() => {
    if (installmentFromUrl) return installmentFromUrl;

    if (listItem) {
      return getInstallmentFromListItem(listItem);
    }

    return undefined;
  }, [installmentFromUrl, listItem]);

  const detailQuery = useCollectionDetail(contractId, installmentNumber);

  const detail = useMemo(() => {
    if (!detailQuery.data) return undefined;
    return mapCollectionDetailToView(detailQuery.data, mode, {
      item: listItem,
    });
  }, [detailQuery.data, mode, listItem]);

  const isLoading = detailQuery.isLoading;
  const isNotFound =
    !installmentNumber ||
    detailQuery.isError ||
    (!detailQuery.isLoading && !detailQuery.data);

  return {
    detail,
    listItem,
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
