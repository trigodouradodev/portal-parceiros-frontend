import { FormChips, FormUpload } from "@/components/ui/rhf-fields";
import { toSelectOptions } from "@/components/ui/select-option";
import {
  INCOME_DOCUMENT_TYPE_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";

export function DocumentsSection() {
  return (
    <div className="flex flex-col gap-5">
      <FormUpload<ProposalFormData>
        name="documents.identification"
        label="Documentos de Identificação"
        required
      />
      <FormUpload<ProposalFormData>
        name="documents.proofOfResidence"
        label="Comprovante de Residência"
        note="Até 90 dias"
        required
      />
      <FormUpload<ProposalFormData>
        name="documents.activityPhotos"
        label="Fotos da Atividade"
        note="Fachada, local de trabalho ou estoque"
        required
      />
      <FormChips<ProposalFormData>
        name="documents.incomeProofTypes"
        label="Comprovantes de Renda"
        description="Selecione o(s) tipo(s) de comprovante disponíveis."
        multiple
        options={toSelectOptions(INCOME_DOCUMENT_TYPE_OPTIONS)}
        required
      />
      <FormUpload<ProposalFormData>
        name="documents.incomeProofs"
        label="Comprovantes"
        required
      />
    </div>
  );
}
