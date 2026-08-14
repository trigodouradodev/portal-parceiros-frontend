import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ChipButton } from "@/features/originacao/components/ChipButton";
import { FileUploadField } from "@/features/originacao/components/FileUploadField";
import {
  INCOME_DOCUMENT_TYPE_OPTIONS,
  isDocumentsValid,
  toggleItem,
  type DocumentsData,
} from "@/features/originacao/data/proposal";

interface DocumentsSectionProps {
  data: DocumentsData;
  onChange: (data: DocumentsData) => void;
  onValidChange: (valid: boolean) => void;
}

export function DocumentsSection({
  data,
  onChange,
  onValidChange,
}: DocumentsSectionProps) {
  function set<K extends keyof DocumentsData>(key: K, value: DocumentsData[K]) {
    onChange({ ...data, [key]: value });
  }

  useEffect(() => {
    onValidChange(isDocumentsValid(data));
  }, [data, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <FileUploadField
        label="Documentos de Identificação"
        value={data.identification}
        onChange={(value) => set("identification", value)}
      />
      <FileUploadField
        label="Comprovante de Residência"
        note="Até 90 dias"
        value={data.proofOfResidence}
        onChange={(value) => set("proofOfResidence", value)}
      />
      <FileUploadField
        label="Fotos da Atividade"
        note="Fachada, local de trabalho ou estoque"
        value={data.activityPhotos}
        onChange={(value) => set("activityPhotos", value)}
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
              active={data.incomeProofTypes.includes(option)}
              onClick={() =>
                set(
                  "incomeProofTypes",
                  toggleItem(data.incomeProofTypes, option),
                )
              }
            >
              {option}
            </ChipButton>
          ))}
        </div>
        <FileUploadField
          label="Comprovantes"
          value={data.incomeProofs}
          onChange={(value) => set("incomeProofs", value)}
        />
      </div>
    </div>
  );
}
