import type { ContractDetailView } from "@/features/contract-detail/types";
import { Timeline } from "@/features/contract-detail/components/Timeline";

interface TimelineSectionProps {
  detail: ContractDetailView;
  onRegisterAction: () => void;
  /** AUREA-330: falso na visualização somente-leitura da Carteira. */
  showAction?: boolean;
  /** AUREA-346: ver TimelineStepItem — escopado só à Carteira por ora. */
  dedupeCtaLabel?: boolean;
  title?: string;
  actionLabel?: string;
}

export function TimelineSection({
  detail,
  onRegisterAction,
  showAction = true,
  dedupeCtaLabel = false,
  title,
  actionLabel,
}: TimelineSectionProps) {
  const doneCount = detail.timeline.filter((s) => s.status === "done").length;
  const totalCount = detail.timeline.length;
  const titlePrefix = title ?? "Histórico";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {titlePrefix} — Parcela {detail.installmentNumber}
        </h2>
        <span className="text-xs text-muted-foreground/80">
          {doneCount}/{totalCount} concluídas
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm md:p-5">
        <Timeline
          steps={detail.timeline}
          onRegisterAction={onRegisterAction}
          showAction={showAction}
          dedupeCtaLabel={dedupeCtaLabel}
          actionLabel={actionLabel}
        />
      </div>
    </div>
  );
}
