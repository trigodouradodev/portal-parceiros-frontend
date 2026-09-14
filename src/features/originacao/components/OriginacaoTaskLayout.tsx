import type { ReactNode } from "react";
import { originacaoCardClassName } from "@/features/originacao/components/OriginacaoPageFrame";
import { ORIGINACAO_TASK_SCROLL_ID } from "@/features/originacao/utils/scroll-to-first-error";

export function OriginacaoTaskLayout({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      {header}
      <div
        id={ORIGINACAO_TASK_SCROLL_ID}
        className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-5 pt-4 pb-8 md:px-8"
      >
        <section className={originacaoCardClassName}>{children}</section>
      </div>
    </div>
  );
}
