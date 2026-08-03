import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

interface PerformanceMessageProps {
  onLogout?: () => void;
  children: ReactNode;
}

export function PerformanceMessage({
  onLogout,
  children,
}: PerformanceMessageProps) {
  return (
    <PageContainer>
      <PageHeader subtitle="Desempenho" onLogout={onLogout} />
      <div className="px-5 pt-6 md:px-8">{children}</div>
    </PageContainer>
  );
}
