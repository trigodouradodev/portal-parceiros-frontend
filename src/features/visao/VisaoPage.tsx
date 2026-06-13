import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PerformanceSection } from "@/features/dashboard/components/PerformanceSection";
import { CommissionSection } from "@/features/dashboard/components/CommissionSection";

export function VisaoPage() {
  return (
    <PageContainer>
      <PageHeader subtitle="Análise de desempenho e comissões" />
      <PerformanceSection />
      <CommissionSection />
    </PageContainer>
  );
}
