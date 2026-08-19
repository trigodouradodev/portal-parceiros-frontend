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
        render={({ field, fieldState }) => (
          <FileUploadField
            name={field.name}
            label="Documentos de Identificação"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />
      <FormField
        control={control}
        name="documents.proofOfResidence"
        render={({ field, fieldState }) => (
          <FileUploadField
            name={field.name}
            label="Comprovante de Residência"
            note="Até 90 dias"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />
      <FormField
        control={control}
        name="documents.activityPhotos"
        render={({ field, fieldState }) => (
          <FileUploadField
            name={field.name}
            label="Fotos da Atividade"
            note="Fachada, local de trabalho ou estoque"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <FormField
        control={control}
        name="documents.incomeProofTypes"
        render={({ field, fieldState }) => (
          <ChipField
            name={field.name}
            label="Comprovantes de Renda"
            description="Selecione o(s) tipo(s) de comprovante disponíveis."
            multiple
            value={field.value}
            onChange={field.onChange}
            options={toSelectOptions(INCOME_DOCUMENT_TYPE_OPTIONS)}
            required
            error={fieldState.error?.message}
          />
        )}
      />
      <FormField
        control={control}
        name="documents.incomeProofs"
        render={({ field, fieldState }) => (
          <FileUploadField
            name={field.name}
            label="Comprovantes"
            value={field.value}
            onChange={field.onChange}
            required
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
}
