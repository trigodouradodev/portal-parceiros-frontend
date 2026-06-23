import { Briefcase, FileText, MapPin, User } from "lucide-react";
import type { ResponsibleType } from "@/services/dashboard/dashboard.types";

interface ClientDetailsCardProps {
  clientName: string;
  clientTaxId?: string;
  clientAddress?: string;
  responsibleName?: string;
  responsibleType?: ResponsibleType;
}

function getResponsibleLabel(type: ResponsibleType): string {
  return type === "COLLECTION_AGENT" ? "Agente de cobrança" : "Consultor";
}

export function ClientDetailsCard({
  clientName,
  clientTaxId,
  clientAddress,
  responsibleName,
  responsibleType,
}: ClientDetailsCardProps) {
  const showResponsible = Boolean(responsibleName && responsibleType);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
          Cliente
        </p>
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <User size={13} className="shrink-0 text-muted-foreground/80" />
          <span>{clientName}</span>
        </div>
        {clientTaxId && (
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <FileText size={13} className="shrink-0 text-muted-foreground/80" />
            <span>{clientTaxId}</span>
          </div>
        )}
        {clientAddress && (
          <div className="flex items-start gap-2 text-sm text-foreground/80">
            <MapPin
              size={13}
              className="mt-0.5 shrink-0 text-muted-foreground/80"
            />
            <span>{clientAddress}</span>
          </div>
        )}
      </div>

      {showResponsible && (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Responsável
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Briefcase
                size={13}
                className="shrink-0 text-muted-foreground/80"
              />
              <span>
                {responsibleName}
                <span className="text-muted-foreground/80">
                  {" "}
                  · {getResponsibleLabel(responsibleType!)}
                </span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
