import { MapPin } from "lucide-react";
import {
  CheckingStatus,
  ConfirmedStatus,
  IdleStatus,
  ManualStatus,
  NotFoundStatus,
} from "./visit-location";

export type VisitLocationStatus =
  | "idle"
  | "checking"
  | "confirmed"
  | "not_found"
  | "manual";

interface PrevVisitLocationPanelProps {
  address: string;
  status: VisitLocationStatus;
  onVerifyLocation: () => void;
  onConfirmManual: () => void;
}

export function PrevVisitLocationPanel({
  address,
  status,
  onVerifyLocation,
  onConfirmManual,
}: PrevVisitLocationPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-background p-4">
        <MapPin size={18} className="mt-0.5 shrink-0 text-brand-navy" />
        <div>
          <p className="mb-0.5 text-xs text-muted-foreground">
            Endereço do cliente
          </p>
          <p className="text-sm font-semibold text-foreground">{address}</p>
        </div>
      </div>

      {status === "idle" && <IdleStatus onVerifyLocation={onVerifyLocation} />}
      {status === "checking" && <CheckingStatus />}
      {status === "confirmed" && <ConfirmedStatus />}
      {status === "manual" && <ManualStatus />}
      {status === "not_found" && (
        <NotFoundStatus onConfirmManual={onConfirmManual} />
      )}
    </div>
  );
}
