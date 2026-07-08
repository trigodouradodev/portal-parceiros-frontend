import type { ChargeQueueSegmentMeta } from "@/features/dashboard/constants/charge-queue-segments";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import type {
  ActivityChannel,
  OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";

export interface ChargeQueueRowView {
  key: string;
  item: OverdueCollectionItem;
  display: ChargeQueueDisplayItem;
  locked: boolean;
}

export interface ChargeQueueBlockView {
  key: string;
  segment: ChargeQueueSegmentMeta;
  rows: ChargeQueueRowView[];
}

export interface ChargeQueueHeroView {
  item: OverdueCollectionItem;
  display: ChargeQueueDisplayItem;
  taskChannel?: ActivityChannel;
}

export interface ChargeQueueTabView {
  hero: ChargeQueueHeroView | null;
  compactHeader: boolean;
  blocks: ChargeQueueBlockView[];
}
