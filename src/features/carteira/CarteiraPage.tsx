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
    <section className="rounded-2xl border border-[#D6D9E3] bg-white p-5 shadow">
      <div className="mb-1 flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-[#1A1D2E] md:text-lg">
          {title}
        </h2>
        <span className="text-xs text-[#9DA3B4]">{description}</span>
      </div>
      <p className="mt-3 text-sm text-[#6B7080]">
        O histórico dos últimos 12 meses entra em uma entrega seguinte.
      </p>
    </section>
  );
}

export function CarteiraPage() {
  const { onMobileLogout } = useOutletContext<ShellContext>();

  return (
    <PageContainer>
      {/* Saudação do shell (logout mobile); o título da tela segue o design na KpiSection. */}
      <PageHeader onLogout={onMobileLogout} />

      <div className="flex flex-col gap-6 px-5 pt-6 md:px-8">
        <KpiSection />
        <SectionPlaceholder
          title="Indicadores de carteira por safra"
          description="Últimos 12 meses"
        />
      </div>
    </PageContainer>
  );
}
