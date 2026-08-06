import { useOutletContext } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiSection } from "@/features/carteira/components/KpiSection";

interface ShellContext {
  onMobileLogout?: () => void;
}

function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-[#D6D9E3] bg-white px-4 py-8 md:px-6">
      <h2 className="font-fraunces text-lg font-bold text-[#1A1D2E]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#6B7080]">{description}</p>
    </section>
  );
}

export function CarteiraPage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();

  return (
    <PageContainer>
      <PageHeader
        subtitle="Acompanhe os indicadores e contratos da sua carteira"
        onLogout={onMobileLogout}
      />

      <div className="flex flex-col gap-6 px-5 pt-6 md:px-8">
        <KpiSection />
        <SectionPlaceholder
          title="Indicadores por safra"
          description="O histórico dos últimos 12 meses entra em uma entrega seguinte."
        />
      </div>
    </PageContainer>
  );
}
