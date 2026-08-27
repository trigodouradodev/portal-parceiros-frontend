import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const originacaoCardClassName =
  "w-full min-w-0 max-w-xl rounded-2xl border border-border bg-card p-5 shadow-sm";

interface OriginacaoPageFrameProps {
  title: string;
  description?: string;
  intro?: ReactNode;
  actions?: ReactNode;
  card?: boolean;
  children: ReactNode;
}

export function OriginacaoPageFrame({
  title,
  description,
  intro,
  actions,
  card = false,
  children,
}: OriginacaoPageFrameProps) {
  const body = card ? (
    <section className={originacaoCardClassName}>{children}</section>
  ) : (
    children
  );

  return (
    <div className="flex-1 px-5 pt-5 pb-24 md:max-w-xl md:px-8 md:pb-8">
      <div
        className={cn(
          "mb-6",
          actions && "flex items-start justify-between gap-3",
        )}
      >
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
          {intro}
        </div>
        {actions}
      </div>
      {body}
    </div>
  );
}
