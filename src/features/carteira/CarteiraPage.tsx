import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { fmtBRL } from "@/lib/utils";
import { carteiraClients } from "@/features/carteira/mocks/clients";

export function CarteiraPage() {
  return (
    <PageContainer>
      <PageHeader subtitle="Visão geral da sua carteira de contratos" />
      <div className="px-5 md:px-8">
        <DataTable
          columns={[
            { key: "name", header: "Cliente" },
            { key: "contract", header: "Contrato" },
            { key: "parcela", header: "Parcela" },
            {
              key: "value",
              header: "Valor",
              render: (row) => fmtBRL(row.value as number),
              className: "font-mono-dm",
            },
            {
              key: "overdueDays",
              header: "Atraso",
              render: (row) => `${row.overdueDays as number}d`,
            },
          ]}
          data={carteiraClients as unknown as Record<string, unknown>[]}
          emptyLabel="Nenhum contrato na carteira."
        />
      </div>
    </PageContainer>
  );
}
