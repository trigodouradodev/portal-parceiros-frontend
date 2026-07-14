import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  onLogout?: () => void;
}

export function DashboardSkeleton({ onLogout }: DashboardSkeletonProps) {
  return (
    <PageContainer>
      <PageHeader subtitle="Carregando..." onLogout={onLogout} />
      <div className="-mt-4 px-5 md:-mt-5 md:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </PageContainer>
  );
}
