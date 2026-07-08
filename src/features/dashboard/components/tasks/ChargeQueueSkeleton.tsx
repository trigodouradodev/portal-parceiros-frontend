import { Skeleton } from "@/components/ui/skeleton";

export function ChargeQueueSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  );
}
