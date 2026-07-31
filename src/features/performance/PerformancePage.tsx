import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelsComparisonTable } from "@/features/performance/components/LevelsComparisonTable";
import { PartnerIdentityBar } from "@/features/performance/components/PartnerIdentityBar";
import { PerformanceMessage } from "@/features/performance/components/PerformanceMessage";
import { PerformanceSkeleton } from "@/features/performance/components/PerformanceSkeleton";
import { RealPerformanceSection } from "@/features/performance/components/RealPerformanceSection";
import { SimulatorSection } from "@/features/performance/components/SimulatorSection";
import {
  isNotFoundError,
  useCurrentPerformance,
  usePartnerProfile,
  usePartnerProgram,
} from "@/hooks/usePerformanceData";
import { getApiErrorMessage } from "@/lib/api/errors";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function PerformancePage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();

  const profileQuery = usePartnerProfile();
  const enrolled = Boolean(profileQuery.data);
  const programQuery = usePartnerProgram({ enabled: enrolled });
  const currentQuery = useCurrentPerformance({ enabled: enrolled });

  if (profileQuery.isPending) {
    return <PerformanceSkeleton onLogout={onMobileLogout} />;
  }

  if (profileQuery.isError) {
    if (isNotFoundError(profileQuery.error)) {
      return (
        <PerformanceMessage onLogout={onMobileLogout}>
          <p className="text-sm text-[#6B7080]">
            Você ainda não participa do Programa de Parceiros Exclusivos.
          </p>
        </PerformanceMessage>
      );
    }
    return (
      <PerformanceMessage onLogout={onMobileLogout}>
        <p className="text-sm text-[#A32D2D]">
          {getApiErrorMessage(
            profileQuery.error,
            "Não foi possível carregar o desempenho.",
          )}
        </p>
      </PerformanceMessage>
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return <PerformanceSkeleton onLogout={onMobileLogout} />;
  }

  const program = programQuery.data;
  const current = currentQuery.data;

  if (
    programQuery.isPending ||
    currentQuery.isPending ||
    !program ||
    !current
  ) {
    if (programQuery.isError || currentQuery.isError) {
      return (
        <PerformanceMessage onLogout={onMobileLogout}>
          <p className="text-sm text-[#A32D2D]">
            {getApiErrorMessage(
              programQuery.error ?? currentQuery.error,
              "Não foi possível carregar o desempenho.",
            )}
          </p>
        </PerformanceMessage>
      );
    }
    return <PerformanceSkeleton onLogout={onMobileLogout} />;
  }

  return (
    <PageContainer>
      <PageHeader
        subtitle="Acompanhe suas metas e a prévia de comissão"
        onLogout={onMobileLogout}
      />

      <div className="flex flex-col gap-6 px-5 pt-6 md:px-8">
        <PartnerIdentityBar profile={profile} />
        <RealPerformanceSection
          profile={profile}
          current={current}
          program={program}
        />
        <SimulatorSection
          key={`${current.month}-${current.origination.amount}-${current.delinquency.rate}-${current.averageRate.rate}-${profile.partnership.monthNumber}`}
          profile={profile}
          current={current}
          program={program}
        />
        <LevelsComparisonTable
          program={program}
          currentLevelKey={profile.level.key}
        />
      </div>
    </PageContainer>
  );
}
