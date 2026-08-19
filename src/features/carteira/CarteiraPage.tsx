import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiSection } from "@/features/carteira/components/KpiSection";
import { SafraSection } from "@/features/carteira/components/SafraSection";

interface ShellContext {
  onMobileLogout?: () => void;
}

export function CarteiraPage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();

  return (
    <PageContainer>
      <PageHeader
        subtitle="Indicadores e contratos da sua carteira"
        onLogout={onMobileLogout}
      />

      <div className="flex flex-col gap-6 px-5 pt-6 md:px-8">
        <KpiSection />
        <SafraSection />
      </div>
    </PageContainer>
  );
}
