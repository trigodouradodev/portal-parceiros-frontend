import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { TaskTab, isTaskTab } from "@/features/dashboard/constants/task-tab";
import { mapCollectionDetailToView } from "@/features/contract-detail/mappers/map-collection-detail";
import { mapInstallmentDetailToView } from "@/features/contract-detail/mappers/map-installment-detail-to-view";
import type { ContractDetailLocationState } from "@/features/contract-detail/types";
import type { DetailMode } from "@/features/contract-detail/types";
import { useCollectionDetail } from "@/hooks/useCollectionDetail";
import { useInstallmentDetail } from "@/hooks/useInstallmentDetail";
import { usePreventiveContractsInfinite } from "@/hooks/useDashboard";
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

function parseInstallmentId(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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
  const isChargeMode = mode === TaskTab.Charge;

  const preventiveQuery = usePreventiveContractsInfinite(30, 15);

  const preventiveItems = useMemo(
    () => preventiveQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [preventiveQuery.data?.pages],
  );

  const installmentFromUrl = parseInstallmentNumber(
    searchParams.get("installment"),
  );
  const installmentIdFromUrl = parseInstallmentId(
    searchParams.get("installmentId"),
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

    if (isChargeMode) {
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
    isChargeMode,
    contractId,
    installmentFromUrl,
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

  const installmentId = useMemo(() => {
    if (installmentIdFromUrl) return installmentIdFromUrl;

    if (listItem && isOverdueCollectionItem(listItem)) {
      return listItem.installment.id;
    }

    return undefined;
  }, [installmentIdFromUrl, listItem]);

  const installmentDetailQuery = useInstallmentDetail(
    installmentId,
    isChargeMode,
  );
  const collectionDetailQuery = useCollectionDetail(
    contractId,
    installmentNumber,
    !isChargeMode,
  );

  const detail = useMemo(() => {
    if (isChargeMode) {
      if (!installmentDetailQuery.data) return undefined;
      return mapInstallmentDetailToView(installmentDetailQuery.data, {
        item:
          listItem && isOverdueCollectionItem(listItem) ? listItem : undefined,
      });
    }

    if (!collectionDetailQuery.data) return undefined;
    return mapCollectionDetailToView(collectionDetailQuery.data, mode, {
      item: listItem,
    });
  }, [
    isChargeMode,
    installmentDetailQuery.data,
    collectionDetailQuery.data,
    mode,
    listItem,
  ]);

  const isLoading = isChargeMode
    ? installmentDetailQuery.isLoading
    : collectionDetailQuery.isLoading;

  const isNotFound = isChargeMode
    ? !installmentId ||
      installmentDetailQuery.isError ||
      (!installmentDetailQuery.isLoading && !installmentDetailQuery.data)
    : !installmentNumber ||
      collectionDetailQuery.isError ||
      (!collectionDetailQuery.isLoading && !collectionDetailQuery.data);

  return {
    detail,
    listItem,
    installmentDetail: installmentDetailQuery.data,
    collectionDetail: collectionDetailQuery.data,
    installmentId,
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
