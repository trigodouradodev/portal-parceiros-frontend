import { useState, type ComponentProps } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CobrTasksTab } from "@/features/dashboard/components/tasks/CobrTasksTab";
import { PrevTasksTab } from "@/features/dashboard/components/tasks/PrevTasksTab";

type TaskTab = "cobr" | "prev";

interface TasksTabsProps {
  cobrCount: number;
  prevCount: number;
  cobr: ComponentProps<typeof CobrTasksTab>;
  prev: ComponentProps<typeof PrevTasksTab>;
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
  cobrCount,
  prevCount,
  cobr,
  prev,
}: TasksTabsProps) {
  const [taskTab, setTaskTab] = useState<TaskTab>("cobr");

  return (
    <Tabs
      value={taskTab}
      onValueChange={(v) => setTaskTab(v as TaskTab)}
      className="w-full"
    >
      <TabsList className="md:w-72">
        <TabsTrigger value="cobr">
          Cobrança
          <TabCount active={taskTab === "cobr"} value={cobrCount} />
        </TabsTrigger>
        <TabsTrigger value="prev">
          Preventivo
          <TabCount active={taskTab === "prev"} value={prevCount} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cobr" className="w-full">
        <CobrTasksTab {...cobr} />
      </TabsContent>

      <TabsContent value="prev" className="w-full">
        <PrevTasksTab {...prev} />
      </TabsContent>
    </Tabs>
  );
}
