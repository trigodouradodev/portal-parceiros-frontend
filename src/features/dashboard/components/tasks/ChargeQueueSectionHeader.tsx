interface ChargeQueueSectionHeaderProps {
  title: string;
  count: number;
}

export function ChargeQueueSectionHeader({
  title,
  count,
}: ChargeQueueSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <span className="text-xs font-medium text-muted-foreground/80">
        {count}
      </span>
    </div>
  );
}
