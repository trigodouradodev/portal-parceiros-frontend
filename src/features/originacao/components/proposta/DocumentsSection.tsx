import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { FileUploadField } from "@/features/originacao/components/FileUploadField";
import {
  INCOME_DOCUMENT_TYPE_OPTIONS,
  toggleItem,
  type ProposalFormData,
} from "@/features/originacao/data/proposal";

export function DocumentsSection() {
  const { control, setValue, watch } = useFormContext<ProposalFormData>();
  const incomeProofTypes = watch("documents.incomeProofTypes");

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

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-[#1A1D2E]">
          Comprovantes de Renda
        </Label>
        <p className="text-xs text-[#9DA3B4]">
          Selecione o(s) tipo(s) de comprovante disponíveis.
        </p>
        <div className="flex flex-wrap gap-2">
          {INCOME_DOCUMENT_TYPE_OPTIONS.map((option) => (
            <ChipButton
              key={option}
              active={incomeProofTypes.includes(option)}
              onClick={() =>
                setValue(
                  "documents.incomeProofTypes",
                  toggleItem(incomeProofTypes, option),
                  { shouldDirty: true },
                )
              }
            >
              {option}
            </ChipButton>
          ))}
        </div>
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
    </div>
  );
}
