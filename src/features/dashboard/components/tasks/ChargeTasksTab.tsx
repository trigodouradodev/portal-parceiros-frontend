import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  ChargeQueueCompactRow,
  DoneCard,
} from "@/features/dashboard/components/task-cards";
import { ChargeQueueHeroCard } from "@/features/dashboard/components/task-cards/ChargeQueueHeroCard";
import { ChargeQueueSectionHeader } from "@/features/dashboard/components/tasks/ChargeQueueSectionHeader";
import { ChargeQueueSegmentHeader } from "@/features/dashboard/components/tasks/ChargeQueueSegmentHeader";
import { ChargeQueueSkeleton } from "@/features/dashboard/components/tasks/ChargeQueueSkeleton";
import { buildChargeQueueTabView } from "@/features/dashboard/mappers/build-charge-queue-tab-view";
import { mapOverdueToQueueDisplay } from "@/features/dashboard/mappers/map-overdue-to-queue-display";
import type { ChargeQueueBlockView } from "@/features/dashboard/types/charge-queue-tab-view";
import {
  buildChargeQueue,
  type ChargeQueueView,
} from "@/features/dashboard/utils/charge-queue";
import type { ChargeQueueSegmentCode } from "@/features/dashboard/constants/charge-queue-segments";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

interface ChargeTasksTabProps {
  isLoading: boolean;
  items: OverdueCollectionItem[];
  onOpen: (item: OverdueCollectionItem) => void;
  onAction: (item: OverdueCollectionItem) => void;
  onWhatsApp?: (item: OverdueCollectionItem) => void;
  onCall?: (item: OverdueCollectionItem) => void;
  onVisit?: (item: OverdueCollectionItem) => void;
  onPostpone: (item: OverdueCollectionItem) => void;
  onRescheduleVisit: (
    item: OverdueCollectionItem,
    date: string,
  ) => boolean | Promise<boolean>;
  isPostponing?: boolean;
  isRescheduling?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  queueView?: ChargeQueueView;
  segmentCounts?: Partial<Record<ChargeQueueSegmentCode, number>>;
  scheduledItems?: OverdueCollectionItem[];
  completedTodayItems?: OverdueCollectionItem[];
  highlightedInstallmentId?: string | null;
  pinnedHighlightItem?: OverdueCollectionItem | null;
  queueTotal?: number;
}

function LoadMoreButton({
  isFetchingNextPage = false,
  onLoadMore,
}: {
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}) {
  let label = "Ver mais";
  if (isFetchingNextPage) {
    label = "Carregando...";
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full rounded-xl"
      disabled={isFetchingNextPage || !onLoadMore}
      onClick={() => onLoadMore?.()}
    >
      {label}
    </Button>
  );
}

/** Fila segmentada de cobrança na Home (AUREA-186). */
export function ChargeTasksTab({
  isLoading,
  items,
  onOpen,
  onAction,
  onWhatsApp,
  onCall,
  onVisit,
  onPostpone,
  onRescheduleVisit,
  isPostponing = false,
  isRescheduling = false,
  hasNextPage,
  isFetchingNextPage = false,
  onLoadMore,
  queueView: queueViewProp,
  segmentCounts,
  scheduledItems = [],
  completedTodayItems = [],
  highlightedInstallmentId = null,
  pinnedHighlightItem = null,
  queueTotal,
}: ChargeTasksTabProps) {
  const pinnedInstallmentId = pinnedHighlightItem?.installment.id ?? null;

  // AUREA-319: secundárias do segmento ativo nascem recolhidas (linha
  // compacta) e só abrem o card completo quando o usuário clica — evita a
  // fila ficar poluída com tudo expandido de uma vez. A #1 (Hero) nunca
  // recolhe.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(installmentId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(installmentId)) {
        next.delete(installmentId);
      } else {
        next.add(installmentId);
      }
      return next;
    });
  }

  const queueView = useMemo(
    () => queueViewProp ?? buildChargeQueue(items),
    [queueViewProp, items],
  );

  const tabView = useMemo(
    () => buildChargeQueueTabView(queueView, { segmentCounts }),
    [queueView, segmentCounts],
  );

  if (isLoading) {
    return <ChargeQueueSkeleton />;
  }

  const hasSecondarySections =
    scheduledItems.length > 0 || completedTodayItems.length > 0;

  if (
    items.length === 0 &&
    !hasNextPage &&
    !hasSecondarySections &&
    !pinnedHighlightItem
  ) {
    return <EmptyState label="Nenhuma cobrança pendente hoje." />;
  }

  const { hero, blocks } = tabView;
  const pinnedDisplay = pinnedHighlightItem
    ? mapOverdueToQueueDisplay(
        pinnedHighlightItem,
        pinnedHighlightItem.queuePosition ?? 1,
      )
    : null;

  let pinnedSectionTitle = "Recém postergada";
  if (pinnedHighlightItem?.wasRescheduled) {
    pinnedSectionTitle = "Recém reagendada";
  }

  // AUREA-319: o bloco do mesmo segmento da recomendada agrupa visualmente
  // com o Hero (borda comum) — é o "segmento ativo", onde qualquer pendente
  // é executável. Os demais blocos (outros segmentos) seguem travados.
  const heroSegmentBlockIndex = hero
    ? blocks.findIndex((block) => block.segment.code === hero.segmentCode)
    : -1;
  const heroSegmentBlock =
    heroSegmentBlockIndex >= 0 ? blocks[heroSegmentBlockIndex] : null;

  function renderRow(row: ChargeQueueBlockView["rows"][number]) {
    const installmentId = row.item.installment.id;
    const highlighted = installmentId === highlightedInstallmentId;

    // Travada (outro segmento): sem alteração, sem clique.
    if (row.locked) {
      return (
        <ChargeQueueCompactRow
          key={row.key}
          display={row.display}
          locked
          installmentId={installmentId}
          highlighted={highlighted}
          onOpen={() => onOpen(row.item)}
        />
      );
    }

    // Desbloqueada (mesmo segmento da recomendada) mas ainda recolhida:
    // linha compacta clicável que expande em vez de navegar.
    if (!expandedIds.has(installmentId)) {
      return (
        <ChargeQueueCompactRow
          key={row.key}
          display={row.display}
          locked={false}
          expandable
          installmentId={installmentId}
          highlighted={highlighted}
          onOpen={() => toggleExpanded(installmentId)}
        />
      );
    }

    // Expandida: card de ação completo, igual ao Hero.
    return (
      <ChargeQueueHeroCard
        key={row.key}
        display={row.display}
        taskChannel={row.taskChannel}
        queueTotal={queueTotal}
        canPostpone={row.canPostpone}
        canRescheduleVisit={row.canRescheduleVisit}
        onOpen={() => onOpen(row.item)}
        onCollapse={() => toggleExpanded(installmentId)}
        onWhatsApp={() => (onWhatsApp ?? onAction)(row.item)}
        onCall={() => (onCall ?? onAction)(row.item)}
        onVisit={() => (onVisit ?? onAction)(row.item)}
        onPostpone={() => onPostpone(row.item)}
        onRescheduleVisit={(date) => onRescheduleVisit(row.item, date)}
        isPostponing={isPostponing}
        isRescheduling={isRescheduling}
      />
    );
  }

  function renderBlock(block: ChargeQueueBlockView) {
    const rows = block.rows.filter(
      (row) => row.item.installment.id !== pinnedInstallmentId,
    );
    if (rows.length === 0) return null;

    return (
      <section key={block.key} className="flex flex-col gap-2">
        <ChargeQueueSegmentHeader
          segment={block.segment}
          count={block.segmentCount ?? rows.length}
        />
        {rows.map(renderRow)}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hero && hero.item.installment.id !== pinnedInstallmentId && (
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-brand-navy/25 bg-brand-navy/[0.03] p-2">
          <ChargeQueueHeroCard
            display={hero.display}
            taskChannel={hero.taskChannel}
            queueTotal={queueTotal}
            canPostpone={hero.canPostpone}
            canRescheduleVisit={hero.canRescheduleVisit}
            onOpen={() => onOpen(hero.item)}
            onWhatsApp={() => (onWhatsApp ?? onAction)(hero.item)}
            onCall={() => (onCall ?? onAction)(hero.item)}
            onVisit={() => (onVisit ?? onAction)(hero.item)}
            onPostpone={() => onPostpone(hero.item)}
            onRescheduleVisit={(date) => onRescheduleVisit(hero.item, date)}
            isPostponing={isPostponing}
            isRescheduling={isRescheduling}
          />
          {heroSegmentBlock && renderBlock(heroSegmentBlock)}
        </div>
      )}

      {pinnedHighlightItem && pinnedDisplay && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader title={pinnedSectionTitle} count={1} />
          <ChargeQueueCompactRow
            display={pinnedDisplay}
            locked={false}
            installmentId={pinnedHighlightItem.installment.id}
            highlighted={
              pinnedHighlightItem.installment.id === highlightedInstallmentId
            }
            onOpen={() => onOpen(pinnedHighlightItem)}
          />
        </section>
      )}

      {blocks.map((block, index) =>
        index === heroSegmentBlockIndex ? null : renderBlock(block),
      )}

      {hasNextPage && (
        <LoadMoreButton
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={onLoadMore}
        />
      )}

      {scheduledItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader
            title="Agendadas"
            count={scheduledItems.length}
          />
          {scheduledItems
            .filter((item) => item.installment.id !== pinnedInstallmentId)
            .map((item, index) => (
              <ChargeQueueCompactRow
                key={item.installment.id}
                display={mapOverdueToQueueDisplay(item, index + 1)}
                locked
                installmentId={item.installment.id}
                highlighted={item.installment.id === highlightedInstallmentId}
                onOpen={() => onOpen(item)}
              />
            ))}
        </section>
      )}

      {completedTodayItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <ChargeQueueSectionHeader
            title="Concluídas hoje"
            count={completedTodayItems.length}
          />
          {completedTodayItems.map((item) => (
            <DoneCard
              key={item.installment.id}
              name={item.client.name}
              contract={`${item.contract.number} · ${item.installment.label}`}
              label="Ação concluída hoje"
              installmentId={item.installment.id}
              highlighted={item.installment.id === highlightedInstallmentId}
            />
          ))}
        </section>
      )}
    </div>
  );
}
