import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextareaField } from "@/components/ui/textarea-field";
import { DeclineReasonPicker } from "@/features/originacao/components/proposta/DeclineReasonPicker";
import {
  DECLINE_NOTE_MAX_LENGTH,
  DECLINE_NOTE_MIN_LENGTH,
  findDeclineReason,
} from "@/features/originacao/data/decline-reasons";
import type { QuoteDeclineReason } from "@/services/quotes/quotes.enums";
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
 * quiser, complementa. "Outro motivo" e "Não atende aos critérios do produto"
 * exigem a observação.
 */
export function DeclineProposalDialog({
  open,
  onOpenChange,
  clientName,
  pending = false,
  onConfirm,
}: DeclineProposalDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmedNote = note.trim();
  const selectedReason = findDeclineReason(reason);
  const noteRequired = selectedReason?.noteRequired === true;
  const noteTooShort =
    noteRequired && trimmedNote.length < DECLINE_NOTE_MIN_LENGTH;
  const reasonError =
    submitted && !reason ? "Selecione o motivo da recusa." : undefined;
  const noteError =
    submitted && noteTooShort
      ? (selectedReason?.noteRequiredMessage ?? "Descreva o motivo da recusa.")
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
    if (!reason || noteTooShort) return;

    await onConfirm({
      reason: reason as QuoteDeclineReason,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] max-w-lg flex-col"
        // O foco inicial iria para a busca e, no celular, o teclado cobriria a
        // lista. O foco vai para o próprio diálogo.
        ref={contentRef}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Recusar proposta</DialogTitle>
          <DialogDescription>
            A proposta de {clientName} ficará como Recusada e não poderá ser
            retomada. Informe o motivo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <DeclineReasonPicker
            value={reason}
            onChange={setReason}
            error={reasonError}
          />
          <TextareaField
            name="declineNote"
            label={
              noteRequired
                ? (selectedReason?.noteLabel ?? "Descreva o motivo")
                : "Observação (opcional)"
            }
            required={noteRequired}
            placeholder={selectedReason?.notePlaceholder}
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
