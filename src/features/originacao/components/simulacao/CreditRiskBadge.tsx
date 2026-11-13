import {
  Ban,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CreditRiskBand } from "@/features/originacao/types";

const CREDIT_RISK_PRESENTATION: Record<
  CreditRiskBand,
  {
    label: string;
    variant: "green" | "amber" | "red" | "red-dark";
    Icon: LucideIcon;
  }
> = {
  low: { label: "Crédito de baixo risco", variant: "green", Icon: ShieldCheck },
  medium: {
    label: "Crédito de médio risco",
    variant: "amber",
    Icon: ShieldAlert,
  },
  high: { label: "Crédito de alto risco", variant: "red", Icon: ShieldX },
  ineligible: {
    label: "Crédito não elegível",
    variant: "red-dark",
    Icon: Ban,
  },
};

/**
 * Indicativo de risco de crédito do cliente. Só a faixa aparece: o score do
 * Serasa não chega ao navegador. Cor e ícone reforçam o texto, nunca o
 * substituem.
 */
export function CreditRiskBadge({ band }: { band: CreditRiskBand }) {
  const { label, variant, Icon } = CREDIT_RISK_PRESENTATION[band];

  return (
    <Badge variant={variant} className="px-2.5 py-1 text-sm">
      <Icon size={16} aria-hidden="true" />
      {label}
    </Badge>
  );
}
