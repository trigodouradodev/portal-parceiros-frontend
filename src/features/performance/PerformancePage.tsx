import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelsComparisonTable } from "@/features/performance/components/LevelsComparisonTable";
import { PartnerIdentityBar } from "@/features/performance/components/PartnerIdentityBar";
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

function PerformanceSkeleton({ onLogout }: { onLogout?: () => void }) {
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

export function PerformancePage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();
  const navigate = useNavigate();

  const profileQuery = usePartnerProfile();
  const enrolled = Boolean(profileQuery.data);
  const programQuery = usePartnerProgram({ enabled: enrolled });
  const currentQuery = useCurrentPerformance({ enabled: enrolled });

  useEffect(() => {
    if (profileQuery.isError && isNotFoundError(profileQuery.error)) {
      navigate("/", { replace: true });
    }
  }, [profileQuery.isError, profileQuery.error, navigate]);

  if (profileQuery.isPending) {
    return <PerformanceSkeleton onLogout={onMobileLogout} />;
  }

  if (profileQuery.isError) {
    if (isNotFoundError(profileQuery.error)) {
      return <PerformanceSkeleton onLogout={onMobileLogout} />;
    }
    return (
      <PageContainer>
        <PageHeader subtitle="Desempenho" onLogout={onMobileLogout} />
        <div className="px-5 pt-6 md:px-8">
          <p className="text-sm text-[#A32D2D]">
            {getApiErrorMessage(
              profileQuery.error,
              "Não foi possível carregar o desempenho.",
            )}
          </p>
        </div>
      </PageContainer>
    );
  }

  const profile = profileQuery.data;
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
        <PageContainer>
          <PageHeader subtitle="Desempenho" onLogout={onMobileLogout} />
          <div className="px-5 pt-6 md:px-8">
            <p className="text-sm text-[#A32D2D]">
              {getApiErrorMessage(
                programQuery.error ?? currentQuery.error,
                "Não foi possível carregar o desempenho.",
              )}
            </p>
          </div>
        </PageContainer>
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
