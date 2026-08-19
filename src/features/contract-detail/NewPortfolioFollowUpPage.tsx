import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActionClient } from "@/contexts/action";
import { PreventiveFollowUpForm } from "@/features/register-action/preventive/PreventiveFollowUpForm";
import { mapPortfolioContractDetailToView } from "@/features/contract-detail/mappers/map-collection-detail";
import { useContractDetailByContractId } from "@/hooks/useContractDetailByContractId";
import { fmtBRL } from "@/lib/utils";

function NewPortfolioFollowUpSkeleton() {
  return (
    <PageContainer>
      <div className="bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <Skeleton className="mb-4 h-5 w-24 bg-white/20" />
        <Skeleton className="mb-2 h-8 w-3/4 bg-white/20" />
        <Skeleton className="h-4 w-1/2 bg-white/20" />
      </div>
      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        <Skeleton className="mb-6 h-20 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

/** Formulário de novo follow-up acessado a partir da parcela da Carteira. */
export function NewPortfolioFollowUpPage() {
  const { contractId = "", installmentNumber: installmentNumberParam } =
    useParams();
  const navigate = useNavigate();
  const installmentNumber = Number.parseInt(installmentNumberParam ?? "", 10);
  const hasValidInstallmentNumber =
    Number.isFinite(installmentNumber) && installmentNumber > 0;
  const detailPath = `/carteira/contratos/${contractId}/parcelas/${installmentNumber}`;
  const contractDetailQuery = useContractDetailByContractId(
    contractId,
    hasValidInstallmentNumber ? installmentNumber : undefined,
    hasValidInstallmentNumber,
  );
  const detail = contractDetailQuery.data
    ? mapPortfolioContractDetailToView(contractDetailQuery.data)
    : undefined;

  if (contractDetailQuery.isLoading) {
    return <NewPortfolioFollowUpSkeleton />;
  }

  if (!hasValidInstallmentNumber || contractDetailQuery.isError || !detail) {
    return (
      <PageContainer>
        <div className="px-5 py-12 md:px-8">
          <EmptyState label="Parcela não encontrada." />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate(`/carteira/contratos/${contractId}`)}
              className="text-sm font-medium text-brand-navy underline"
            >
              Voltar para o contrato
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const client: ActionClient = {
    id: detail.contractId,
    installmentNumber: detail.installmentNumber,
    name: detail.clientName,
    contract: detail.contractCode,
    parcela: `Parc ${detail.installmentNumber}/${detail.totalInstallments}`,
    value: fmtBRL(detail.installmentValue),
    currentStep: detail.statusLabel,
    daysInfo: detail.statusLabel,
    phone: contractDetailQuery.data?.client.phone,
    address: detail.address,
  };

  return (
    <PreventiveFollowUpForm
      client={client}
      onBack={() => navigate(-1)}
      onSaved={() => navigate(detailPath, { replace: true })}
    />
  );
}
