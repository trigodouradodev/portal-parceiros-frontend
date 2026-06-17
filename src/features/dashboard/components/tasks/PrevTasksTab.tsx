import { EmptyState } from "@/components/feedback/EmptyState";
import {
  DoneCard,
  PrevTaskCard,
} from "@/features/dashboard/components/task-cards";
import type { PrevClient } from "@/features/dashboard/mocks/tasks";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

interface PrevDoneClient {
  client: PrevClient;
  label: string;
}

interface PrevTasksTabProps {
  pending: PrevClient[];
  done: PrevDoneClient[];
  onAction: (client: PrevClient) => void;
  onReopen: (id: string) => void;
}

export function PrevTasksTab({
  pending,
  done,
  onAction,
  onReopen,
}: PrevTasksTabProps) {
  return (
    <div className={GRID_CLASS}>
      {pending.map((c) => (
        <PrevTaskCard key={c.id} client={c} onAction={() => onAction(c)} />
      ))}

      {done.map(({ client, label }) => (
        <DoneCard
          key={client.id}
          name={client.name}
          contract={client.contract}
          label={label}
          onReopen={() => onReopen(client.id)}
        />
      ))}

      {pending.length === 0 && (
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <EmptyState label="Nenhuma tarefa preventiva pendente hoje." />
        </div>
      )}
    </div>
  );
}
