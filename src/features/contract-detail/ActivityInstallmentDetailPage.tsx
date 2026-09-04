import { useLocation, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useActionContext } from "@/contexts/action";
import { useAuth } from "@/contexts/auth/auth-context";
import { useToast } from "@/contexts/toast/toast-context";
import { ClientDetailsCard } from "@/features/contract-detail/components/ClientDetailsCard";
import { ContractInfoCard } from "@/features/contract-detail/components/ContractInfoCard";
import { DetailPageHeader } from "@/features/contract-detail/components/DetailPageHeader";
import { TimelineSection } from "@/features/contract-detail/components/TimelineSection";
import { mapInstallmentDetailToView } from "@/features/contract-detail/mappers/map-installment-detail-to-view";
import type { ActivityInstallmentLocationState } from "@/features/contract-detail/types";
import {
  buildChargeActionPayloadFromInstallmentDetail,
  getChargeRegisterPath,
} from "@/features/dashboard/utils/launch-action";
import { useInstallmentDetail } from "@/hooks/useInstallmentDetail";
import {
  useScheduledEarlyExecutionPermission,
  useTaskInteractionPermission,
} from "@/hooks/useTaskInteractionPermission";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

function isOverdueCollectionItem(
  item: ActivityInstallmentLocationState["item"],
): item is OverdueCollectionItem {
  return Boolean(item && "daysOverdue" in item.installment);
}

function ActivityInstallmentDetailSkeleton() {
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
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

/**
 * Detalhe de uma atividade iniciada pela Home.
 *
 * Esta tela depende exclusivamente de GET /activities/installments/:id e não
 * participa dos fluxos de Carteira nem carrega contratos preventivos.
 */
export function ActivityInstallmentDetailPage() {
  const { installmentId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setActionData } = useActionContext();
  const { user } = useAuth();
  const { showToast } = useToast();
  const canInteractWithTask = useTaskInteractionPermission();
  const canExecuteScheduledEarly = useScheduledEarlyExecutionPermission();
  const locationState =
    location.state as ActivityInstallmentLocationState | null;
  const sourceItem = isOverdueCollectionItem(locationState?.item)
    ? locationState.item
    : undefined;
  const isEarlyScheduledExecution = canExecuteScheduledEarly(sourceItem);
  const canRegisterAction =
    canInteractWithTask(sourceItem) || isEarlyScheduledExecution;
  const installmentDetailQuery = useInstallmentDetail(installmentId);

  const detail = installmentDetailQuery.data
    ? mapInstallmentDetailToView(installmentDetailQuery.data, {
        item: sourceItem,
      })
    : undefined;

  function handleBack() {
    navigate(-1);
  }

  function handleRegisterAction() {
    if (!canRegisterAction) {
      showToast("Esta tarefa está disponível somente para visualização.", {
        variant: "destructive",
      });
      return;
    }

    if (!installmentDetailQuery.data) {
      showToast("Não foi possível carregar o detalhe da parcela.", {
        variant: "destructive",
      });
      return;
    }

    const payload = buildChargeActionPayloadFromInstallmentDetail(
      installmentDetailQuery.data,
      () => showToast("Ação registrada."),
      { preferredTaskId: sourceItem?.task?.id },
    );

    if (!payload) {
      showToast("Nenhuma tarefa de cobrança pendente para esta parcela.", {
        variant: "destructive",
      });
      return;
    }

    setActionData(payload);
    navigate(getChargeRegisterPath());
  }

  if (installmentDetailQuery.isLoading) {
    return <ActivityInstallmentDetailSkeleton />;
  }

  if (installmentDetailQuery.isError || !detail) {
    return (
      <PageContainer>
        <div className="px-5 py-12 md:px-8">
          <EmptyState label="Parcela não encontrada." />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-brand-navy underline"
            >
              Voltar ao dashboard
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
        onBack={handleBack}
      />

      <div className="flex-1 px-5 pb-28 md:px-8 md:pb-10">
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-6 lg:pt-6">
          <div className="flex flex-col gap-4 pt-4 lg:pt-0">
            <ContractInfoCard detail={detail} />
            <ClientDetailsCard detail={detail} />
            <div className="lg:hidden">
              <TimelineSection
                detail={detail}
                onRegisterAction={handleRegisterAction}
                showAction={canRegisterAction}
                title="Cobrança"
                actionLabel={
                  isEarlyScheduledExecution ? "Executar agora" : undefined
                }
              />
            </div>
          </div>

          <div className="sticky top-6 hidden lg:block">
            <TimelineSection
              detail={detail}
              onRegisterAction={handleRegisterAction}
              showAction={canRegisterAction}
              title="Cobrança"
              actionLabel={
                isEarlyScheduledExecution ? "Executar agora" : undefined
              }
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
