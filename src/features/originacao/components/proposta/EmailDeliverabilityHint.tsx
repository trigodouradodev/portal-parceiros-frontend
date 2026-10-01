import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FieldHint } from "@/components/ui/field-hint";
import {
  EmailDeliverabilityStatus,
  type EmailDeliverabilityStatus as EmailDeliverabilityStatusType,
} from "@/features/originacao/hooks/useEmailDeliverability";

interface EmailDeliverabilityHintProps {
  status: EmailDeliverabilityStatusType;
}

/**
 * Feedback não-bloqueante da verificação de entregabilidade — nunca impede
 * o avanço por si só:
 * - `checking`: aviso discreto (spinner) enquanto a ZeroBounce responde.
 * - `unavailable`: alerta de que não foi possível verificar (fail-open) —
 *   só um aviso, o preenchimento segue normal.
 * O estado `blocked` não é tratado aqui — quem exige confirmação antes de
 * avançar é `PropostaPage` (diálogo, não este componente).
 */
export function EmailDeliverabilityHint({
  status,
}: EmailDeliverabilityHintProps) {
  if (status === EmailDeliverabilityStatus.CHECKING) {
    return (
      <FieldHint>
        <span className="flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" />
          Verificando entregabilidade do e-mail…
        </span>
      </FieldHint>
    );
  }

  if (status === EmailDeliverabilityStatus.UNAVAILABLE) {
    return (
      <Alert variant="warning" className="py-2">
        <AlertTriangle size={16} />
        <AlertTitle className="text-xs">
          Não foi possível verificar a entregabilidade deste e-mail. Confira se
          está correto.
        </AlertTitle>
      </Alert>
    );
  }

  return null;
}
