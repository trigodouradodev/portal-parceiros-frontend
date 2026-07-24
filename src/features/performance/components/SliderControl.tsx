interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  valueLabel: string;
  hint: string;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueLabel,
  hint,
}: SliderControlProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-[#6B7080]">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E2E4EC] accent-brand-navy [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-navy [&::-webkit-slider-thumb]:shadow"
      />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[#1A1D2E]">{valueLabel}</span>
        <span className="text-right text-[10px] text-[#6B7080]">{hint}</span>
      </div>
    </div>
  );
}
