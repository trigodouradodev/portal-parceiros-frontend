import type {
  ChargeQueueSegmentCode,
  ChargeQueueSegmentMeta,
} from "@/features/dashboard/constants/charge-queue-segments";
import type { ChargeQueueDisplayItem } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import type {
  ActivityChannel,
  OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";

export interface ChargeQueueRowView {
  key: string;
  item: OverdueCollectionItem;
  display: ChargeQueueDisplayItem;
  /**
   * Mesmos campos do Hero (AUREA-319): quando `locked` é false, a linha
   * também é executável e renderiza como card de ação completo, não como
   * linha compacta que navega pro contrato.
   */
  taskChannel?: ActivityChannel;
  canPostpone: boolean;
  canRescheduleVisit: boolean;
  segmentCode: ChargeQueueSegmentCode;
  locked: boolean;
}

export interface ChargeQueueBlockView {
  key: string;
  segment: ChargeQueueSegmentMeta;
  /** Total do segmento na API (travadas); fallback = rows carregadas. */
  segmentCount?: number;
  rows: ChargeQueueRowView[];
}

export interface ChargeQueueHeroView {
  item: OverdueCollectionItem;
  display: ChargeQueueDisplayItem;
  taskChannel?: ActivityChannel;
  canPostpone: boolean;
  canRescheduleVisit: boolean;
  /** Segmento da recomendada — usado pra agrupar visualmente com seu bloco (AUREA-319). */
  segmentCode: ChargeQueueSegmentCode;
}

export interface ChargeQueueTabView {
  hero: ChargeQueueHeroView | null;
  blocks: ChargeQueueBlockView[];
}
