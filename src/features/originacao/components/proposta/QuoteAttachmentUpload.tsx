import { useRef, useState, type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Loader2, Paperclip, X } from "lucide-react";
import {
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { useToast } from "@/contexts/toast/toast-context";
import type {
  DocumentAttachmentItem,
  ProposalFormData,
} from "@/features/originacao/data/proposal";
import {
  useRemoveQuoteAttachment,
  useUploadQuoteAttachment,
} from "@/features/originacao/hooks/useQuoteDocumentation";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type {
  IncomeProofType,
  QuoteAttachmentType as QuoteAttachmentTypeValue,
} from "@/services/quotes/quotes.enums";
import { QuoteAttachmentType } from "@/services/quotes/quotes.enums";

type AttachmentFieldName =
  | "documents.identification"
  | "documents.proofOfResidence"
  | "documents.activityPhotos"
  | "documents.incomeProofs";

interface QuoteAttachmentUploadProps {
  quoteId: string;
  name: AttachmentFieldName;
  attachmentType: QuoteAttachmentTypeValue;
  label: string;
  note?: string;
  accept: string;
  required?: boolean;
  /** Obrigatório para comprovante de renda. */
  incomeProofType?: IncomeProofType | null;
  disabled?: boolean;
}

export function QuoteAttachmentUpload({
  quoteId,
  name,
  attachmentType,
  label,
  note,
  accept,
  required,
  incomeProofType = null,
  disabled = false,
}: QuoteAttachmentUploadProps) {
  const { watch, setValue, getFieldState, formState } =
    useFormContext<ProposalFormData>();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busyName, setBusyName] = useState<string | null>(null);
  const upload = useUploadQuoteAttachment(quoteId);
  const remove = useRemoveQuoteAttachment(quoteId);

  const files = (watch(name) as DocumentAttachmentItem[] | undefined) ?? [];
  const error = getFieldState(name, formState).error?.message;
  const busy = busyName !== null || upload.isPending || remove.isPending;

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;

    if (
      attachmentType === QuoteAttachmentType.PROOF_OF_INCOME &&
      incomeProofType == null
    ) {
      showToast("Selecione o tipo de comprovante de renda antes de anexar.", {
        variant: "destructive",
      });
      return;
    }

    for (const file of selected) {
      setBusyName(file.name);
      try {
        const snapshot = await upload.mutateAsync({
          attachmentType,
          file,
          ...(incomeProofType ? { incomeProofType } : {}),
        });
        const next: DocumentAttachmentItem = {
          id: snapshot.id,
          filename: snapshot.filename,
          ...(snapshot.incomeProofType
            ? { incomeProofType: snapshot.incomeProofType }
            : {}),
        };
        const current =
          (watch(name) as DocumentAttachmentItem[] | undefined) ?? [];
        setValue(name, [...current, next], {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (err) {
        showToast(
          getApiErrorMessage(err, `Não foi possível enviar ${file.name}.`),
          { variant: "destructive" },
        );
      }
    }
    setBusyName(null);
  }

  async function handleRemove(attachment: DocumentAttachmentItem) {
    setBusyName(attachment.filename);
    try {
      await remove.mutateAsync(attachment.id);
      const current =
        (watch(name) as DocumentAttachmentItem[] | undefined) ?? [];
      setValue(
        name,
        current.filter((item) => item.id !== attachment.id),
        { shouldDirty: true, shouldValidate: true },
      );
    } catch (err) {
      showToast(
        getApiErrorMessage(
          err,
          `Não foi possível remover ${attachment.filename}.`,
        ),
        { variant: "destructive" },
      );
    } finally {
      setBusyName(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5" {...fieldAnchorProps(name, error)}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        disabled={disabled || busy}
        onChange={(event) => {
          void handleChange(event);
        }}
      />
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between gap-2 rounded-2xl bg-success-bg px-4 py-3 text-sm font-medium text-success"
        >
          <span className="flex items-center gap-2 truncate">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="truncate">{file.filename}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              void handleRemove(file);
            }}
            disabled={busy}
            className="shrink-0 text-success hover:text-success/80 disabled:opacity-50"
            aria-label={`Remover ${file.filename}`}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={disabled || busy}
        className={cn(
          "flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-semibold hover:bg-muted disabled:opacity-50",
          error
            ? "border-destructive text-destructive"
            : "border-border text-muted-foreground",
        )}
      >
        {busy ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {busyName ? `Enviando ${busyName}…` : "Processando…"}
          </>
        ) : (
          <>
            <Paperclip size={15} />
            {files.length === 0
              ? `Anexar ${label.toLowerCase()}`
              : "Anexar mais um arquivo"}
          </>
        )}
      </button>
      {note ? <FieldHint>{note}</FieldHint> : null}
      <FieldErrorMessage error={error} />
    </div>
  );
}
