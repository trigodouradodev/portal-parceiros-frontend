import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChipField } from "@/components/ui/chip-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextareaField } from "@/components/ui/textarea-field";
import {
  DECLINE_NOTE_MAX_LENGTH,
  DECLINE_OTHER_NOTE_MIN_LENGTH,
  DECLINE_REASON_OPTIONS,
} from "@/features/originacao/data/decline-reasons";
import { QuoteDeclineReason } from "@/services/quotes/quotes.enums";
import type { DeclineQuotePayload } from "@/services/quotes/quotes.types";

interface DeclineProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nome do cliente, para o parceiro confirmar qual proposta está recusando. */
  clientName: string;
  pending?: boolean;
  onConfirm: (payload: DeclineQuotePayload) => void | Promise<void>;
}

/**
 * Recusa de um rascunho da Canal Digital: o parceiro escolhe o motivo e, se
 * quiser, complementa. "Outro motivo" exige a observação.
 */
export function DeclineProposalDialog({
  open,
  onOpenChange,
  clientName,
  pending = false,
  onConfirm,
}: DeclineProposalDialogProps) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmedNote = note.trim();
  const isOther = reason === QuoteDeclineReason.OTHER;
  const reasonError =
    submitted && !reason ? "Selecione o motivo da recusa." : undefined;
  const noteError =
    submitted && isOther && trimmedNote.length < DECLINE_OTHER_NOTE_MIN_LENGTH
      ? "Descreva o motivo da recusa."
      : undefined;

  function reset() {
    setReason("");
    setNote("");
    setSubmitted(false);
  }

  // Quem fecha o diálogo depois de uma recusa bem-sucedida é o pai, trocando
  // `open` direto, sem passar por `handleOpenChange`. Limpar só ali deixava o
  // motivo e a observação da proposta anterior preenchidos na próxima, e eles
  // podiam ser gravados no histórico errado. Por isso o reset acompanha o
  // fechamento, seja qual for o caminho (ajuste de estado na renderização, o
  // padrão do React para reagir a uma mudança de prop).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    setSubmitted(true);
    if (!reason) return;
    if (isOther && trimmedNote.length < DECLINE_OTHER_NOTE_MIN_LENGTH) return;

    await onConfirm({
      reason: reason as QuoteDeclineReason,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recusar proposta</DialogTitle>
          <DialogDescription>
            A proposta de {clientName} ficará como Recusada e não poderá ser
            retomada. Informe o motivo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <ChipField
            name="declineReason"
            label="Motivo"
            required
            options={DECLINE_REASON_OPTIONS}
            value={reason}
            onChange={setReason}
            error={reasonError}
          />
          <TextareaField
            name="declineNote"
            label={isOther ? "Descreva o motivo" : "Observação (opcional)"}
            required={isOther}
            value={note}
            onChange={(value) =>
              setNote(value.slice(0, DECLINE_NOTE_MAX_LENGTH))
            }
            error={noteError}
            hint={`${note.length}/${DECLINE_NOTE_MAX_LENGTH}`}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void handleConfirm()}
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : null}
            Recusar proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
