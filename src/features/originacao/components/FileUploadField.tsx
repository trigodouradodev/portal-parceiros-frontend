import { useRef, type ChangeEvent } from "react";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadFieldProps {
  label: string;
  note?: string;
  value?: string[];
  onChange?: (fileNames: string[]) => void;
}

/** Controlado — guarda só os nomes dos arquivos (mock, sem upload real). */
export function FileUploadField({
  label,
  note,
  value,
  onChange,
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
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {files.map((name, i) => (
        <div
          key={`${name}-${i}`}
          className="flex items-center justify-between gap-2 rounded-2xl bg-[#E6F7F1] px-4 py-3 text-sm font-medium text-[#0F6E56]"
        >
          <span className="flex items-center gap-2 truncate">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="truncate">{name}</span>
          </span>
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="shrink-0 text-[#0F6E56] hover:text-[#0A4C3D]"
            aria-label={`Remover ${name}`}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C8CBD8] text-sm font-semibold text-[#6B7080] hover:bg-[#F5F6FA]"
      >
        <Paperclip size={15} />
        {files.length === 0
          ? `Anexar ${label.toLowerCase()}`
          : "Anexar mais um arquivo"}
      </button>
      {note ? <p className="text-xs text-[#9DA3B4]">{note}</p> : null}
    </div>
  );
}
