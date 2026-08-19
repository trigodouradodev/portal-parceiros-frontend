import { useFormContext } from "react-hook-form";
import { ChipField } from "@/components/ui/chip-field";
import { FormField } from "@/components/ui/form";
import { toSelectOptions } from "@/components/ui/select-option";
import { FileUploadField } from "@/features/originacao/components/FileUploadField";
import {
  INCOME_DOCUMENT_TYPE_OPTIONS,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";

export function DocumentsSection() {
  const { control } = useFormContext<ProposalFormData>();

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={control}
        name="documents.identification"
        render={({ field }) => (
          <FileUploadField
            label="Documentos de Identificação"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={control}
        name="documents.proofOfResidence"
        render={({ field }) => (
          <FileUploadField
            label="Comprovante de Residência"
            note="Até 90 dias"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={control}
        name="documents.activityPhotos"
        render={({ field }) => (
          <FileUploadField
            label="Fotos da Atividade"
            note="Fachada, local de trabalho ou estoque"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <FormField
        control={control}
        name="documents.incomeProofTypes"
        render={({ field }) => (
          <ChipField
            label="Comprovantes de Renda"
            description="Selecione o(s) tipo(s) de comprovante disponíveis."
            multiple
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(INCOME_DOCUMENT_TYPE_OPTIONS)}
          />
        )}
      />
      <FormField
        control={control}
        name="documents.incomeProofs"
        render={({ field }) => (
          <FileUploadField
            label="Comprovantes"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
