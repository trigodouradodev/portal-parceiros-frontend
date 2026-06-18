import type { ReactNode } from "react";

interface RegisterActionFooterProps {
  children: ReactNode;
}

export function RegisterActionFooter({ children }: RegisterActionFooterProps) {
  return <div className="mt-6 flex gap-2">{children}</div>;
}
