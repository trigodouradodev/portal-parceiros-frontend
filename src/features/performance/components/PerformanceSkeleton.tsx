import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceSkeletonProps {
  onLogout?: () => void;
}

export function PerformanceSkeleton({ onLogout }: PerformanceSkeletonProps) {
  return (
    <PageContainer>
      <PageHeader subtitle="Carregando desempenho..." onLogout={onLogout} />
      <div className="flex flex-col gap-6 px-5 pt-6 md:px-8">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </PageContainer>
  );
}
