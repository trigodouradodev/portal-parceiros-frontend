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
  buildChargeActionPayload,
  buildPreventiveActionPayload,
  getChargeRegisterPath,
  getPreventiveRegisterPath,
} from "@/features/dashboard/utils/launch-action";
import { mapPreventiveContractToPrevClient } from "@/features/dashboard/utils/task-mappers";
import { AlertCard } from "@/features/contract-detail/components/AlertCard";
import { ContractInfoCard } from "@/features/contract-detail/components/ContractInfoCard";
import { DetailPageHeader } from "@/features/contract-detail/components/DetailPageHeader";
import { TimelineSection } from "@/features/contract-detail/components/TimelineSection";
import {
  parseDetailMode,
  useContractDetail,
} from "@/features/contract-detail/hooks/useContractDetail";
import { useActionContext } from "@/contexts/action";
import { useToast } from "@/contexts/toast/toast-context";
import type {
  OverdueContract,
  PreventiveContract,
} from "@/services/dashboard/dashboard.types";
import { fmtBRL } from "@/lib/utils";

function isOverdueContract(
  contract: OverdueContract | PreventiveContract,
): contract is OverdueContract {
  return "firstOverdueInstallment" in contract;
}

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
  const { showToast } = useToast();

  const { detail, contract, isLoading, isNotFound } = useContractDetail(
    contractId,
    mode,
  );

  const handleBack = () => {
    writeTaskTabCookie(mode);
    navigate("/");
  };

  const handleRegisterAction = () => {
    writeTaskTabCookie(readTaskTabFromCookie());

    if (mode === TaskTab.Charge && contract && isOverdueContract(contract)) {
      setActionData(
        buildChargeActionPayload(contract, () => {
          showToast("Ação registrada.");
        }),
      );
      navigate(getChargeRegisterPath());
      return;
    }

    if (
      mode === TaskTab.Preventive &&
      contract &&
      !isOverdueContract(contract)
    ) {
      const prevClient = mapPreventiveContractToPrevClient(contract);
      setActionData(
        buildPreventiveActionPayload(prevClient, () => {
          showToast("Contato preventivo registrado!");
        }),
      );
      navigate(getPreventiveRegisterPath());
      return;
    }

    if (!detail) return;

    setActionData({
      mode,
      client: {
        id: detail.contractId,
        installmentNumber: detail.installmentNumber,
        name: detail.clientName,
        contract: detail.contractCode,
        parcela: `Parc ${detail.installmentNumber}/${detail.totalInstallments}`,
        value: fmtBRL(detail.installmentValue),
        currentStep: detail.statusLabel,
        daysInfo: buildDaysInfoFromDetail(mode, detail.alertDays),
        phone: contract?.clientPhone,
        address: contract?.address,
      },
      onComplete: () => {
        showToast(
          mode === TaskTab.Charge
            ? "Ação registrada."
            : "Contato preventivo registrado!",
        );
      },
    });
    navigate(
      mode === TaskTab.Charge
        ? getChargeRegisterPath()
        : getPreventiveRegisterPath(),
    );
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
        businessName={detail.businessName}
        contractCode={detail.contractCode}
        partnerName={detail.partnerName}
        statusLabel={detail.statusLabel}
        statusColor={detail.statusColor}
        onBack={handleBack}
      />

      <div className="flex-1 px-5 pb-28 md:px-8 md:pb-10">
        <div className="md:grid md:grid-cols-[1fr_400px] md:items-start md:gap-6 md:pt-6">
          <div className="flex flex-col gap-4 pt-4 md:pt-0">
            <ContractInfoCard
              installmentValue={detail.installmentValue}
              installmentTotalAmount={detail.installmentTotalAmount}
              installmentNumber={detail.installmentNumber}
              totalInstallments={detail.totalInstallments}
              contractTotalAmount={detail.contractTotalAmount}
              contractStartDate={detail.contractStartDate}
              contractEndDate={detail.contractEndDate}
              nextDue={detail.nextDue}
            />

            {detail.alertType !== undefined &&
              detail.alertDays !== undefined && (
                <AlertCard
                  type={detail.alertType}
                  days={detail.alertDays}
                  onAction={handleRegisterAction}
                />
              )}

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
