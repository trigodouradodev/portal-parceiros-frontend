import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceDataSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando dados da competência"
      className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,1fr)]"
    >
      <Skeleton className="h-36 rounded-2xl lg:col-start-2 lg:row-start-1 lg:h-96" />
      <div className="space-y-4 lg:col-start-1 lg:row-start-1">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </div>
  );
}

export function PerformanceSkeleton({ onLogout }: { onLogout?: () => void }) {
  return (
    <PageContainer>
      <PageHeader subtitle="Carregando desempenho..." onLogout={onLogout} />
      <div className="px-5 pt-6 md:px-8">
        <PerformanceDataSkeleton />
      </div>
    </PageContainer>
  );
}
