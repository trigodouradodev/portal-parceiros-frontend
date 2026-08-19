import { useRef, type ChangeEvent } from "react";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  name?: string;
  label: string;
  note?: string;
  value?: string[];
  onChange?: (fileNames: string[]) => void;
  required?: boolean;
  error?: string;
}

/** Controlado — guarda só os nomes dos arquivos (mock, sem upload real). */
export function FileUploadField({
  name,
  label,
  note,
  value,
  onChange,
  required,
  error,
}: FileUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const files = value ?? [];

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const added = Array.from(event.target.files ?? []).map((file) => file.name);
    if (added.length === 0) return;
    onChange?.([...files, ...added]);
    event.target.value = "";
  }

  function handleRemove(index: number) {
    onChange?.(files.filter((_, i) => i !== index));
  }

  return (
    <div
      className="flex flex-col gap-1.5"
      {...fieldAnchorProps(name, error)}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {files.map((fileName, i) => (
        <div
          key={`${fileName}-${i}`}
          className="flex items-center justify-between gap-2 rounded-2xl bg-[#E6F7F1] px-4 py-3 text-sm font-medium text-[#0F6E56]"
        >
          <span className="flex items-center gap-2 truncate">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="truncate">{fileName}</span>
          </span>
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="shrink-0 text-[#0F6E56] hover:text-[#0A4C3D]"
            aria-label={`Remover ${fileName}`}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={cn(
          "flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-semibold hover:bg-[#F5F6FA]",
          error
            ? "border-[#D84040] text-[#D84040]"
            : "border-[#C8CBD8] text-[#6B7080]",
        )}
      >
        <Paperclip size={15} />
        {files.length === 0
          ? `Anexar ${label.toLowerCase()}`
          : "Anexar mais um arquivo"}
      </button>
      {note ? <p className="text-xs text-[#9DA3B4]">{note}</p> : null}
      <FieldErrorMessage error={error} />
    </div>
  );
}
