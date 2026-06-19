interface RegisterStagePillsProps {
  steps: string[];
  activeIndex: number;
}

export function RegisterStagePills({
  steps,
  activeIndex,
}: RegisterStagePillsProps) {
  return (
    <div className="no-scrollbar mb-6 flex items-center gap-1 overflow-x-auto">
      {steps.map((label, index) => (
        <div
          key={label}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            index === activeIndex
              ? "bg-brand-navy text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
