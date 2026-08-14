import { ChipButton } from "@/features/originacao/components/ChipButton";

interface YesNoChipsProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function YesNoChips({ value, onChange }: YesNoChipsProps) {
  return (
    <div className="flex gap-2">
      <ChipButton active={value === true} onClick={() => onChange(true)}>
        Sim
      </ChipButton>
      <ChipButton active={value === false} onClick={() => onChange(false)}>
        Não
      </ChipButton>
    </div>
  );
}
