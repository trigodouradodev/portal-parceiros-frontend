import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { QuoteActivityPermissions } from "@/hooks/useQuoteActivityPermissions";
import { getBackofficeUrl } from "@/lib/backoffice";

type QuoteActivityPermissionsAlertProps = QuoteActivityPermissions;

const simulationBlockers = [
  "Recém vencido — D+1–2",
  "Promessa quebrada",
  "FPD — inadimplência do 1º pagamento",
  "Atraso D+2–5",
];

const proposalCreationBlockers = [
  ...simulationBlockers,
  "Atraso D+6–15",
  "Pós carta D+15",
  "Risco negativação",
];

function QuoteAction({
  label,
  allowed,
  href,
}: {
  label: string;
  allowed: boolean;
  href: string;
}) {
  if (allowed) {
    return (
      <Button asChild variant="outline" className="w-full md:w-auto">
        <a href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button disabled variant="outline" className="w-full md:w-auto">
      {label}
    </Button>
  );
}

function PermissionExplanation({
  label,
  allowed,
  blockers,
}: {
  label: string;
  allowed: boolean;
  blockers: string[];
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span
          className={
            allowed
              ? "text-xs font-semibold text-success"
              : "text-xs font-semibold text-warning"
          }
        >
          {allowed ? "Liberado" : "Bloqueado"}
        </span>
      </div>
      {allowed ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Não há ações pendentes que impeçam este acesso.
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Para habilitar este acesso, conclua ou reagende todas as ações
            pendentes destas faixas:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function QuoteActivityPermissionsAlert({
  canSimulateQuote,
  canCreateQuote,
}: QuoteActivityPermissionsAlertProps) {
  return (
    <Dialog>
      <section aria-label="Acessos a propostas" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A1D2E] md:text-lg">
            Propostas
          </h2>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Entenda como liberar propostas"
            >
              <CircleHelp />
            </Button>
          </DialogTrigger>
        </div>
        <div className="flex w-full flex-wrap justify-between gap-3 md:w-auto md:self-end md:justify-end">
          <QuoteAction
            label="Simular proposta"
            allowed={canSimulateQuote}
            href={getBackofficeUrl("/quotes")}
          />
          <QuoteAction
            label="Criar proposta"
            allowed={canCreateQuote}
            href={getBackofficeUrl("/quotes/create/register")}
          />
        </div>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Como liberar os acessos a propostas</DialogTitle>
            <DialogDescription>
              A disponibilidade de cada acesso depende das ações pendentes na
              sua fila.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <PermissionExplanation
              label="Simular proposta"
              allowed={canSimulateQuote}
              blockers={simulationBlockers}
            />
            <PermissionExplanation
              label="Criar proposta"
              allowed={canCreateQuote}
              blockers={proposalCreationBlockers}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Entendi</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </section>
    </Dialog>
  );
}
