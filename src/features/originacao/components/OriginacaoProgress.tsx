interface OriginacaoProgressProps {
  value: number;
}

export function OriginacaoProgress({ value }: OriginacaoProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#E2E4EC]">
      <div
        className="h-full rounded-full bg-brand-navy transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
