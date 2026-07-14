import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskTab } from "@/features/dashboard/constants/task-tab";
import {
  readTaskTabFromCookie,
  writeTaskTabCookie,
} from "@/features/dashboard/constants/task-tab";
import {
  buildChargeActionPayloadFromInstallmentDetail,
  buildPreventiveActionPayload,
  getChargeRegisterPath,
  getPreventiveRegisterPath,
} from "@/features/dashboard/utils/launch-action";
import { mapPreventiveItemToPrevClient } from "@/features/dashboard/utils/task-mappers";
import { ClientDetailsCard } from "@/features/contract-detail/components/ClientDetailsCard";
import { ContractInfoCard } from "@/features/contract-detail/components/ContractInfoCard";
import { DetailPageHeader } from "@/features/contract-detail/components/DetailPageHeader";
import { TimelineSection } from "@/features/contract-detail/components/TimelineSection";
import {
  isOverdueCollectionItem,
  parseDetailMode,
  useContractDetail,
} from "@/features/contract-detail/hooks/useContractDetail";
import { useActionContext } from "@/contexts/action";
import { useAuth } from "@/contexts/auth/auth-context";
import { useToast } from "@/contexts/toast/toast-context";
import { fmtBRL } from "@/lib/utils";

function buildDaysInfoFromDetail(
  mode: typeof TaskTab.Charge | typeof TaskTab.Preventive,
  alertDays: number | undefined,
): string {
  const days = alertDays ?? 0;

  if (mode === TaskTab.Charge) {
    return `${days} dia${days !== 1 ? "s" : ""} em atraso`;
  }

  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanhã";
  return `Vence em ${days} dia${days !== 1 ? "s" : ""}`;
}

function ContractDetailSkeleton() {
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
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

export function ContractDetailPage() {
  const { contractId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const mode = parseDetailMode(searchParams.get("mode"));
  const navigate = useNavigate();
  const { setActionData } = useActionContext();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { detail, listItem, installmentDetail, isLoading, isNotFound } =
    useContractDetail(contractId, mode);

  const handleBack = () => {
    writeTaskTabCookie(mode);
    navigate("/");
  };

  const handleRegisterAction = () => {
    writeTaskTabCookie(readTaskTabFromCookie());

    if (mode === TaskTab.Charge) {
      if (!installmentDetail) {
        showToast("Não foi possível carregar o detalhe da parcela.", {
          variant: "destructive",
        });
        return;
      }
      const preferredTaskId =
        listItem && isOverdueCollectionItem(listItem)
          ? listItem.task?.id
          : undefined;
      const payload = buildChargeActionPayloadFromInstallmentDetail(
        installmentDetail,
        () => {
          showToast("Ação registrada.");
        },
        { preferredTaskId },
      );
      if (!payload) {
        showToast("Nenhuma tarefa de cobrança pendente para esta parcela.", {
          variant: "destructive",
        });
        return;
      }
      setActionData(payload);
      navigate(getChargeRegisterPath());
      return;
    }

    if (
      mode === TaskTab.Preventive &&
      listItem &&
      !isOverdueCollectionItem(listItem)
    ) {
      const prevClient = mapPreventiveItemToPrevClient(listItem);
      setActionData(
        buildPreventiveActionPayload(prevClient, () => {
          showToast("Contato preventivo registrado!");
        }),
      );
      navigate(getPreventiveRegisterPath());
      return;
    }

    if (!detail) return;

    // Charge already returned above; this fallback is preventive-only.
    setActionData({
      mode: TaskTab.Preventive,
      client: {
        id: detail.contractId,
        installmentNumber: detail.installmentNumber,
        name: detail.clientName,
        contract: detail.contractCode,
        parcela: `Parc ${detail.installmentNumber}/${detail.totalInstallments}`,
        value: fmtBRL(detail.installmentValue),
        currentStep: detail.statusLabel,
        daysInfo: buildDaysInfoFromDetail(TaskTab.Preventive, detail.alertDays),
        phone: listItem?.client.phone,
        address: listItem?.client.address ?? detail.address,
      },
      onComplete: () => {
        showToast("Contato preventivo registrado!");
      },
    });
    navigate(getPreventiveRegisterPath());
  };

  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  if (isNotFound || !detail) {
    return (
      <PageContainer>
        <div className="px-5 py-12 md:px-8">
          <EmptyState label="Contrato não encontrado." />
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
        <div className="md:grid md:grid-cols-[1fr_400px] md:items-start md:gap-6 md:pt-6">
          <div className="flex flex-col gap-4 pt-4 md:pt-0">
            <ContractInfoCard detail={detail} />

            <ClientDetailsCard detail={detail} />

            <div className="md:hidden">
              <TimelineSection
                detail={detail}
                onRegisterAction={handleRegisterAction}
              />
            </div>
          </div>

          <div className="sticky top-6 hidden md:block">
            <TimelineSection
              detail={detail}
              onRegisterAction={handleRegisterAction}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
