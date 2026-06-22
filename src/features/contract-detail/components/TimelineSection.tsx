import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { ContractDetailView } from "@/features/contract-detail/types";
import { Timeline } from "@/features/contract-detail/components/Timeline";

interface TimelineSectionProps {
  detail: ContractDetailView;
  onRegisterAction: () => void;
}

export function TimelineSection({
  detail,
  onRegisterAction,
}: TimelineSectionProps) {
  const doneCount = detail.timeline.filter((s) => s.status === "done").length;
  const totalCount = detail.timeline.length;
  const titlePrefix =
    detail.mode === TaskTab.Charge ? "Cobrança" : "Jornada";

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
        />
      </div>
    </div>
  );
}
