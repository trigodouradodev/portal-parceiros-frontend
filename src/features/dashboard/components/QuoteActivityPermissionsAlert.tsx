import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";

interface QuoteActivityPermissionsAlertProps extends QuoteActivityPermissions {}

function PermissionStatus({
  label,
  allowed,
}: {
  label: string;
  allowed: boolean;
}) {
  return (
    <p>
      {label}:{" "}
      <span
        className={allowed ? "font-semibold text-success" : "font-semibold"}
      >
        {allowed ? "Liberado" : "Bloqueado"}
      </span>
    </p>
  );
}

export function QuoteActivityPermissionsAlert({
  canSimulateQuote,
  canCreateQuote,
}: QuoteActivityPermissionsAlertProps) {
  const hasBlockedAction = !canSimulateQuote || !canCreateQuote;

  return (
    <Alert variant={hasBlockedAction ? "warning" : "success"}>
      {hasBlockedAction ? <LockKeyhole /> : <CheckCircle2 />}
      <AlertTitle>Status das propostas</AlertTitle>
      <AlertDescription>
        <PermissionStatus label="Simular proposta" allowed={canSimulateQuote} />
        <PermissionStatus label="Criar proposta" allowed={canCreateQuote} />
        {hasBlockedAction && (
          <p className="mt-2">
            Execute ou reagende as ações pendentes para liberar as opções.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
