import type { ReactNode } from "react";

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border pt-2">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
