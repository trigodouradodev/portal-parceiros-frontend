import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelsComparisonTable } from "@/features/performance/components/LevelsComparisonTable";
import { PartnerIdentityBar } from "@/features/performance/components/PartnerIdentityBar";
import { RealPerformanceSection } from "@/features/performance/components/RealPerformanceSection";
import { SimulatorSection } from "@/features/performance/components/SimulatorSection";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function PerformancePage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();

  return (
    <PageContainer>
      <PageHeader
        subtitle="Acompanhe suas metas e a prévia de comissão"
        onLogout={onMobileLogout}
      />

      <div className="flex flex-col gap-6 px-5 pt-6 md:px-8">
        <PartnerIdentityBar />
        <RealPerformanceSection />
        <SimulatorSection />
        <LevelsComparisonTable />
      </div>
    </PageContainer>
  );
}
