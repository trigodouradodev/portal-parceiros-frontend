import { Info } from "lucide-react";
import { CreditRiskBadge } from "@/features/originacao/components/simulacao/CreditRiskBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditRiskBand } from "@/services/origination/origination.types";

const BAND_EXPLANATIONS: { band: CreditRiskBand; text: string }[] = [
  {
    band: CreditRiskBand.LOW,
    text: "Score alto: o cliente tem um bom histórico de crédito.",
  },
  {
    band: CreditRiskBand.MEDIUM,
    text: "Score intermediário: pede atenção na análise.",
  },
  {
    band: CreditRiskBand.HIGH,
    text: "Score baixo: o histórico de crédito do cliente é frágil.",
  },
];

/**
 * Ícone de informação que abre a explicação do critério do risco de crédito.
 * Explica a regra sem expor o score do cliente nem os limites das faixas, que
 * ficam no backend.
 */
export function CreditRiskInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Entenda o risco de crédito"
          className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Info size={18} aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Como o risco de crédito é definido</DialogTitle>
          <DialogDescription>
            Um indicativo para apoiar a conversa com o cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-foreground">
          <p>
            Ao simular, consultamos o Serasa pelo CPF do cliente. Com base no
            score de crédito dele, o cliente entra em uma de três faixas:
          </p>
          <ul className="space-y-3">
            {BAND_EXPLANATIONS.map(({ band, text }) => (
              <li key={band} className="flex flex-col items-start gap-1">
                <CreditRiskBadge band={band} />
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">
            O score em si não é mostrado. A faixa é só uma referência e não
            substitui a análise de crédito. Se o Serasa não tiver informação
            sobre o CPF, nenhuma faixa aparece.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
