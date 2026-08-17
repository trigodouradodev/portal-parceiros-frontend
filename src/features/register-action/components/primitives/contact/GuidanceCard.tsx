interface GuidanceCardProps {
  title: string;
  body: string;
}

export function GuidanceCard({ title, body }: GuidanceCardProps) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <p className="text-sm leading-relaxed text-foreground/80">{body}</p>
    </div>
  );
}
