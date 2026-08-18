import { ChipButton } from "@/components/ui/chip-button";
import { Label } from "@/components/ui/label";

interface YesNoFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
      <div className="flex gap-2">
        <ChipButton active={value === true} onClick={() => onChange(true)}>
          Sim
        </ChipButton>
        <ChipButton active={value === false} onClick={() => onChange(false)}>
          Não
        </ChipButton>
      </div>
    </div>
  );
}
