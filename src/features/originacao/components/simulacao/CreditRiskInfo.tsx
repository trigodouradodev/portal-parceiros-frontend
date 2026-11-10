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

// Os limites (400 e 700) espelham o padrão de `CREDIT_RISK_BANDS` no backend.
// Se o backend passar a usar outros limites em `system_configs`, atualize aqui.
const BAND_EXPLANATIONS: { band: CreditRiskBand; text: string }[] = [
  {
    band: CreditRiskBand.LOW,
    text: "Score Serasa acima de 700: o cliente tem um bom histórico de crédito.",
  },
  {
    band: CreditRiskBand.MEDIUM,
    text: "Score Serasa de 400 a 700: pede atenção na análise.",
  },
  {
    band: CreditRiskBand.HIGH,
    text: "Score Serasa abaixo de 400: o histórico de crédito do cliente é frágil.",
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
            Um indicativo do Serasa para apoiar a conversa com o cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-foreground">
          <p>
            Ao simular, consultamos o Serasa pelo CPF do cliente. Com base no
            score de crédito dele no Serasa, o cliente entra em uma de três
            faixas:
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
            O score em si não é mostrado. Se o Serasa não tiver informação sobre
            o CPF, nenhuma faixa aparece.
          </p>
          <div className="rounded-lg bg-muted p-3 text-muted-foreground">
            <p className="font-medium text-foreground">
              Este indicativo é exclusivamente do Serasa.
            </p>
            <p className="mt-1">
              Ele não é o Score Aurea, que é a nossa própria avaliação do
              cliente, e não é a única forma de analisar a capacidade de crédito
              dele. A faixa é só uma referência e não substitui a análise de
              crédito.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
