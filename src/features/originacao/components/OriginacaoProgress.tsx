import { cn } from "@/lib/utils";

interface OriginacaoProgressProps {
  value: number;
  tone?: "default" | "onDark";
}

export function OriginacaoProgress({
  value,
  tone = "default",
}: OriginacaoProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full",
        tone === "onDark" ? "bg-white/20" : "bg-border",
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tone === "onDark" ? "bg-brand-yellow" : "bg-brand-navy",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
