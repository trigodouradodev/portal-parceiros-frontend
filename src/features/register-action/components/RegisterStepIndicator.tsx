interface RegisterStepIndicatorProps {
  steps: string[];
  currentStep: number;
  connectorClassName?: string;
}

export function RegisterStepIndicator({
  steps,
  currentStep,
  connectorClassName = "mx-2 h-px w-8 bg-border",
}: RegisterStepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center gap-0">
      {steps.map((label, index) => (
        <div key={label} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 text-xs ${
              index < currentStep
                ? "text-success"
                : index === currentStep
                  ? "font-semibold text-brand-navy"
                  : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold ${
                index < currentStep
                  ? "border-success bg-success text-white"
                  : index === currentStep
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-muted-foreground/40 text-muted-foreground/40"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span>{label}</span>
          </div>
          {index < steps.length - 1 && <div className={connectorClassName} />}
        </div>
      ))}
    </div>
  );
}
