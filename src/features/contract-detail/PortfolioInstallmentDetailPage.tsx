import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth/auth-context";
import { ClientDetailsCard } from "@/features/contract-detail/components/ClientDetailsCard";
import { ContractInfoCard } from "@/features/contract-detail/components/ContractInfoCard";
import { DetailPageHeader } from "@/features/contract-detail/components/DetailPageHeader";
import { TimelineSection } from "@/features/contract-detail/components/TimelineSection";
import { mapPortfolioInstallmentDetailToView } from "@/features/contract-detail/mappers/map-collection-detail";
import { useContractDetailByContractId } from "@/hooks/useContractDetailByContractId";

function PortfolioInstallmentDetailSkeleton() {
  return (
    <PageContainer>
      <div className="bg-brand-yellow px-5 pb-6 pt-12 md:px-8 md:pt-8">
        <Skeleton className="mb-4 h-5 w-24 bg-brand-navy/15" />
        <Skeleton className="mb-2 h-8 w-3/4 bg-brand-navy/15" />
        <Skeleton className="h-4 w-1/2 bg-brand-navy/15" />
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
 * Detalhe de uma parcela na Carteira.
 * A timeline usa exclusivamente os follow-ups devolvidos para a parcela
 * selecionada em GET /contracts/:id?installmentNumber=:number.
 */
export function PortfolioInstallmentDetailPage() {
  const { contractId = "", installmentNumber: installmentNumberParam } =
    useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const installmentNumber = Number.parseInt(installmentNumberParam ?? "", 10);
  const hasValidInstallmentNumber =
    Number.isFinite(installmentNumber) && installmentNumber > 0;
  const contractDetailQuery = useContractDetailByContractId(
    contractId,
    hasValidInstallmentNumber ? installmentNumber : undefined,
    hasValidInstallmentNumber,
  );
  const detail = contractDetailQuery.data
    ? mapPortfolioInstallmentDetailToView(contractDetailQuery.data)
    : undefined;
  const contractPath = `/carteira/contratos/${contractId}`;
  const newFollowUpPath = `${contractPath}/parcelas/${installmentNumber}/follow-ups/novo`;

  if (!hasValidInstallmentNumber || contractDetailQuery.isError || !detail) {
    if (contractDetailQuery.isLoading) {
      return <PortfolioInstallmentDetailSkeleton />;
    }

    return (
      <PageContainer>
        <div className="px-5 py-12 md:px-8">
          <EmptyState label="Parcela não encontrada." />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate(contractPath)}
              className="text-sm font-medium text-brand-navy underline"
            >
              Voltar para o contrato
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
      />

      <div className="flex-1 px-5 pb-10 md:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-6 lg:pt-6">
          <div className="flex flex-col gap-4 pt-4 lg:pt-0">
            <ContractInfoCard detail={detail} />
            <ClientDetailsCard detail={detail} />
            <div className="lg:hidden">
              <TimelineSection
                detail={detail}
                onRegisterAction={() => navigate(newFollowUpPath)}
                title="Follow-ups"
                actionLabel="Adicionar follow-up"
              />
            </div>
          </div>

          <div className="sticky top-6 hidden lg:block">
            <TimelineSection
              detail={detail}
              onRegisterAction={() => navigate(newFollowUpPath)}
              title="Follow-ups"
              actionLabel="Adicionar follow-up"
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
