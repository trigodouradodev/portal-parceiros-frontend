import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth/auth-context";
import { ClientDetailsCard } from "@/features/contract-detail/components/ClientDetailsCard";
import { ContractInfoCard } from "@/features/contract-detail/components/ContractInfoCard";
import { ContractInstallmentsSection } from "@/features/contract-detail/components/ContractInstallmentsSection";
import { DetailPageHeader } from "@/features/contract-detail/components/DetailPageHeader";
import { mapPortfolioContractDetailToView } from "@/features/contract-detail/mappers/map-collection-detail";
import { useContractDetailByContractId } from "@/hooks/useContractDetailByContractId";

function PortfolioContractDetailSkeleton() {
  return (
    <PageContainer>
      <div className="bg-brand-navy px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <Skeleton className="mb-4 h-5 w-24 bg-white/20" />
        <Skeleton className="mb-2 h-8 w-3/4 bg-white/20" />
        <Skeleton className="h-4 w-1/2 bg-white/20" />
      </div>
      <div className="flex flex-col gap-4 px-5 py-4 md:px-8">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

/**
 * Detalhe geral de um contrato na Carteira.
 * A timeline é exclusiva do detalhe de uma parcela e não é exibida aqui.
 */
export function PortfolioContractDetailPage() {
  const { contractId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contractDetailQuery = useContractDetailByContractId(contractId);
  const detail = contractDetailQuery.data
    ? mapPortfolioContractDetailToView(contractDetailQuery.data)
    : undefined;

  if (contractDetailQuery.isLoading) {
    return <PortfolioContractDetailSkeleton />;
  }

  if (contractDetailQuery.isError || !detail) {
    return (
      <PageContainer>
        <div className="px-5 py-12 md:px-8">
          <EmptyState label="Contrato não encontrado." />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-brand-navy underline"
            >
              Voltar para a Carteira
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DetailPageHeader
        detail={detail}
        partnerName={user?.full_name}
        onBack={() => navigate(-1)}
        hideStatus
      />

      <div className="flex-1 px-5 pb-10 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 pt-4 lg:pt-6">
          <ContractInfoCard
            detail={detail}
            hideInstallmentBadge
            showInstallmentInfo={false}
          />
          <ClientDetailsCard detail={detail} />
          <ContractInstallmentsSection contractId={contractId} />
        </div>
      </div>
    </PageContainer>
  );
}
