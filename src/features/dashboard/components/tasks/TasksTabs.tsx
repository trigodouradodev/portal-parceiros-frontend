import { useState, type ComponentProps } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChargeTasksTab } from "@/features/dashboard/components/tasks/ChargeTasksTab";
import { PrevTasksTab } from "@/features/dashboard/components/tasks/PrevTasksTab";
import {
  isTaskTab,
  readTaskTabFromCookie,
  TaskTab,
  writeTaskTabCookie,
} from "@/features/dashboard/constants/task-tab";

interface TasksTabsProps {
  chargeCount: number;
  preventiveCount: number;
  charge: ComponentProps<typeof ChargeTasksTab>;
  preventive: ComponentProps<typeof PrevTasksTab>;
}

function TabCount({ active, value }: { active: boolean; value: number }) {
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        active
          ? "bg-brand-navy text-white"
          : "bg-[#D8D9E0] text-muted-foreground/80"
      }`}
    >
      {value}
    </span>
  );
}

export function TasksTabs({
  chargeCount,
  preventiveCount,
  charge,
  preventive,
}: TasksTabsProps) {
  const [, setRevision] = useState(0);
  const taskTab = readTaskTabFromCookie();

  return (
    <Tabs
      value={taskTab}
      onValueChange={(value) => {
        if (!isTaskTab(value)) return;
        writeTaskTabCookie(value);
        setRevision((n) => n + 1);
      }}
      className="w-full"
    >
      <TabsList className="md:w-72">
        <TabsTrigger value={TaskTab.Charge}>
          Cobrança
          <TabCount active={taskTab === TaskTab.Charge} value={chargeCount} />
        </TabsTrigger>
        <TabsTrigger value={TaskTab.Preventive}>
          Preventivo
          <TabCount
            active={taskTab === TaskTab.Preventive}
            value={preventiveCount}
          />
        </TabsTrigger>
      </TabsList>

      <TabsContent value={TaskTab.Charge} className="w-full">
        <ChargeTasksTab {...charge} />
      </TabsContent>

      <TabsContent value={TaskTab.Preventive} className="w-full">
        <PrevTasksTab {...preventive} />
      </TabsContent>
    </Tabs>
  );
}
