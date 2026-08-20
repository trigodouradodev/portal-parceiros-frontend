import type { ReactNode } from "react";

export function OriginacaoTaskLayout({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      {header}
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-5 pt-4 pb-4 md:px-8">
        <section className="w-full min-w-0 max-w-xl rounded-2xl border border-[#E2E4EC] bg-white p-5 shadow-sm">
          {children}
        </section>
      </div>
      {footer ? (
        <div className="shrink-0 border-t border-[#E2E4EC] bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8">
          <div className="flex w-full max-w-xl gap-2">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
