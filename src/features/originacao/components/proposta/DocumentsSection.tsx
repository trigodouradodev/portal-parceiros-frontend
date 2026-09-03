import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormChips } from "@/components/ui/rhf-fields";
import { useToast } from "@/contexts/toast/toast-context";
import { QuoteAttachmentUpload } from "@/features/originacao/components/proposta/QuoteAttachmentUpload";
import {
  INCOME_DOCUMENT_TYPE_OPTIONS,
  type DocumentAttachmentItem,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";
import { useQuoteAttachments } from "@/features/originacao/hooks/useQuoteDocumentation";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  AvailableIncomeProof,
  QuoteAttachmentType,
} from "@/services/quotes/quotes.enums";
import type { IncomeProofType } from "@/services/quotes/quotes.enums";
import type { QuoteAttachmentSnapshot } from "@/services/quotes/quotes.types";

function toFormAttachment(
  snapshot: QuoteAttachmentSnapshot,
): DocumentAttachmentItem {
  return {
    id: snapshot.id,
    filename: snapshot.filename,
    ...(snapshot.incomeProofType
      ? { incomeProofType: snapshot.incomeProofType }
      : {}),
  };
}

interface DocumentsSectionProps {
  quoteId: string;
}

export function DocumentsSection({ quoteId }: DocumentsSectionProps) {
  const { watch, setValue } = useFormContext<ProposalFormData>();
  const { showToast } = useToast();
  const attachmentsQuery = useQuoteAttachments(quoteId);
  const availableProof = watch("activityIncome.availableProof");
  const incomeProofTypes = watch("documents.incomeProofTypes");
  const incomeProofRequired = availableProof !== AvailableIncomeProof.NONE;
  const selectedIncomeProofType =
    (incomeProofTypes[0] as IncomeProofType | undefined) ?? null;
  const loading = attachmentsQuery.isLoading || attachmentsQuery.isFetching;

  useEffect(() => {
    if (!attachmentsQuery.isSuccess || !attachmentsQuery.data) return;
    const groups = attachmentsQuery.data;
    setValue(
      "documents.identification",
      groups.identificationDocuments.map(toFormAttachment),
      { shouldDirty: false },
    );
    setValue(
      "documents.proofOfResidence",
      groups.proofOfResidence.map(toFormAttachment),
      { shouldDirty: false },
    );
    setValue(
      "documents.activityPhotos",
      groups.activityPhotos.map(toFormAttachment),
      { shouldDirty: false },
    );
    setValue(
      "documents.incomeProofs",
      groups.proofOfIncome.map(toFormAttachment),
      { shouldDirty: false },
    );
    const types = [
      ...new Set(
        groups.proofOfIncome
          .map((item) => item.incomeProofType)
          .filter((value): value is IncomeProofType => Boolean(value)),
      ),
    ];
    if (types.length > 0) {
      setValue("documents.incomeProofTypes", types, { shouldDirty: false });
    }
  }, [attachmentsQuery.data, attachmentsQuery.isSuccess, setValue]);

  useEffect(() => {
    if (!attachmentsQuery.isError) return;
    showToast(
      getApiErrorMessage(
        attachmentsQuery.error,
        "Não foi possível carregar os anexos.",
      ),
      { variant: "destructive" },
    );
  }, [attachmentsQuery.error, attachmentsQuery.isError, showToast]);

  return (
    <div className="flex flex-col gap-5">
      <QuoteAttachmentUpload
        quoteId={quoteId}
        name="documents.identification"
        attachmentType={QuoteAttachmentType.IDENTIFICATION_DOCUMENT}
        label="Documentos de Identificação"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        required
        disabled={loading}
      />
      <QuoteAttachmentUpload
        quoteId={quoteId}
        name="documents.proofOfResidence"
        attachmentType={QuoteAttachmentType.PROOF_OF_RESIDENCE}
        label="Comprovante de Residência"
        note="Até 90 dias · PDF, JPEG ou PNG"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        required
        disabled={loading}
      />
      <QuoteAttachmentUpload
        quoteId={quoteId}
        name="documents.activityPhotos"
        attachmentType={QuoteAttachmentType.ACTIVITY_PHOTO}
        label="Fotos da Atividade"
        note="Fachada, local de trabalho ou estoque · JPEG ou PNG"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        required
        disabled={loading}
      />
      {incomeProofRequired ? (
        <>
          <FormChips<ProposalFormData>
            name="documents.incomeProofTypes"
            label="Comprovantes de Renda"
            description="Selecione o(s) tipo(s). O primeiro selecionado será usado nos próximos anexos."
            multiple
            options={INCOME_DOCUMENT_TYPE_OPTIONS}
            required
          />
          <QuoteAttachmentUpload
            quoteId={quoteId}
            name="documents.incomeProofs"
            attachmentType={QuoteAttachmentType.PROOF_OF_INCOME}
            label="Comprovantes"
            note="Somente PDF · máx. 10 MB"
            accept=".pdf,application/pdf"
            required
            incomeProofType={selectedIncomeProofType}
            disabled={loading}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Comprovante de renda não é obrigatório: no passo Atividade e Renda foi
          informado que não há comprovante disponível.
        </p>
      )}
    </div>
  );
}
