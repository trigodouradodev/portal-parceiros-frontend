import type { ReactNode } from "react";
import { Briefcase, FileText, MapPin, User } from "lucide-react";
import type { ContractDetailView } from "@/features/contract-detail/types";
import type { ResponsibleType } from "@/services/dashboard/dashboard.types";

interface ClientDetailsCardProps {
  detail: ContractDetailView;
}

const ICON_CLASS = "shrink-0 text-muted-foreground/80";

function getResponsibleIcon(type?: ResponsibleType): ReactNode {
  if (type === "COLLECTION_AGENT") {
    return <Briefcase size={13} className={ICON_CLASS} />;
  }

  return <User size={13} className={ICON_CLASS} />;
}

export function ClientDetailsCard({ detail }: ClientDetailsCardProps) {
  const {
    clientName,
    clientTaxId,
    clientAddress,
    responsibleName,
    responsibleType,
  } = detail;
  const showResponsible = Boolean(responsibleName);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
          Cliente
        </p>
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <User size={13} className={ICON_CLASS} />
          <span>{clientName}</span>
        </div>
        {clientTaxId && (
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <FileText size={13} className={ICON_CLASS} />
            <span>{clientTaxId}</span>
          </div>
        )}
        {clientAddress && (
          <div className="flex items-start gap-2 text-sm text-foreground/80">
            <MapPin size={13} className={`mt-0.5 ${ICON_CLASS}`} />
            <span>{clientAddress}</span>
          </div>
        )}
      </div>

      {showResponsible && (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Responsáveis
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              {getResponsibleIcon(responsibleType)}
              <span>{responsibleName}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
